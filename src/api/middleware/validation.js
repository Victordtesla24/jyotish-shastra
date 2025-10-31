import Joi from 'joi';

export default function validation(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // Transform Joi errors into user-friendly format
      const errors = error.details.map(detail => ({
        field: detail.path?.join('.') || 'unknown',
        message: detail.message,
        value: detail.context?.value
      }));
      
      // ENHANCED: BTR Validation Failure Logging
      if (req.path && req.path.includes('rectification')) {
        console.error('🚨 BTR Validation FAILED:', {
          endpoint: req.path,
          method: req.method,
          requestBodyStructure: {
            hasBirthData: !!req.body.birthData,
            birthDataFields: req.body.birthData ? Object.keys(req.body.birthData) : [],
            hasProposedTime: !!req.body.proposedTime,
            hasLifeEvents: !!req.body.lifeEvents,
            bodyKeys: Object.keys(req.body)
          },
          validationErrors: error.details.map(detail => ({
            field: detail.path?.join('.'),
            message: detail.message,
            contextType: detail.type,
            contextValue: detail.context?.value,
            path: detail.path,
            validationRule: detail.type
          })),
          joiErrorCount: error.details.length,
          timestamp: new Date().toISOString(),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
        
        // Check if this is a coordinate-related validation failure
        const coordinateErrors = error.details.filter(detail => {
          const field = detail.path?.join('.');
          return field && (
            field.includes('latitude') || 
            field.includes('longitude') || 
            field.includes('timezone') || 
            field.includes('placeOfBirth')
          );
        });
        
        if (coordinateErrors.length > 0) {
          console.error('🗺️ BTR Coordinate Validation Specific Issues:', {
            coordinateErrors,
            requestCoordinates: {
              lat: req.body.birthData?.latitude,
              lng: req.body.birthData?.longitude,
              tz: req.body.birthData?.timezone,
              placeOfBirth: req.body.birthData?.placeOfBirth
            },
            endpoint: req.path,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        message: 'Request validation failed',
        details: errors,
        errors: errors, // Include both for compatibility
        timestamp: new Date().toISOString()
      });
    }
    
    // ENHANCED: BTR Validation Success Logging
    if (req.path && req.path.includes('rectification')) {
      console.log('✅ BTR Validation SUCCESS:', {
        endpoint: req.path,
        method: req.method,
        validatedFields: Object.keys(value),
        hasBirthData: !!value.birthData,
        birthDataHasCoordinates: value.birthData?.latitude && value.birthData?.longitude,
        timestamp: new Date().toISOString()
      });
    }
    
    // Attach validated value to request for use in handlers
    req.validatedBody = value;
    next();
  };
};
