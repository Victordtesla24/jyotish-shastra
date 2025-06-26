/**
 * Migration: Create Users Table
 *
 * Creates the main users table with all necessary fields for user management,
 * authentication, subscription tracking, and profile information.
 *
 * Reference: System Architecture - Database Schema
 */

const migration = {
    name: '001_create_users_table',
    description: 'Create users table with authentication and profile fields',
    version: '1.0.0',

    /**
     * Apply the migration
     */
    async up(db) {
        console.log('Creating users table...');

        // Create users collection with schema validation
        await db.createCollection('users', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['email', 'password', 'createdAt'],
                    properties: {
                        _id: {
                            bsonType: 'objectId',
                            description: 'Unique user identifier'
                        },
                        email: {
                            bsonType: 'string',
                            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                            description: 'User email address (unique)'
                        },
                        password: {
                            bsonType: 'string',
                            minLength: 60,
                            maxLength: 60,
                            description: 'Bcrypt hashed password'
                        },
                        profile: {
                            bsonType: 'object',
                            properties: {
                                firstName: {
                                    bsonType: 'string',
                                    maxLength: 50,
                                    description: 'User first name'
                                },
                                lastName: {
                                    bsonType: 'string',
                                    maxLength: 50,
                                    description: 'User last name'
                                },
                                displayName: {
                                    bsonType: 'string',
                                    maxLength: 100,
                                    description: 'Display name for the user'
                                },
                                dateOfBirth: {
                                    bsonType: 'date',
                                    description: 'User date of birth'
                                },
                                gender: {
                                    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
                                    description: 'User gender'
                                },
                                bio: {
                                    bsonType: 'string',
                                    maxLength: 500,
                                    description: 'User biography'
                                },
                                avatar: {
                                    bsonType: 'string',
                                    description: 'Avatar image URL'
                                },
                                location: {
                                    bsonType: 'object',
                                    properties: {
                                        country: { bsonType: 'string', maxLength: 100 },
                                        state: { bsonType: 'string', maxLength: 100 },
                                        city: { bsonType: 'string', maxLength: 100 },
                                        timezone: { bsonType: 'string', maxLength: 50 }
                                    }
                                }
                            }
                        },
                        subscription: {
                            bsonType: 'object',
                            required: ['type', 'status'],
                            properties: {
                                type: {
                                    enum: ['free', 'basic', 'premium', 'enterprise'],
                                    description: 'Subscription tier'
                                },
                                status: {
                                    enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
                                    description: 'Subscription status'
                                },
                                startDate: {
                                    bsonType: 'date',
                                    description: 'Subscription start date'
                                },
                                endDate: {
                                    bsonType: 'date',
                                    description: 'Subscription end date'
                                },
                                trialEndDate: {
                                    bsonType: 'date',
                                    description: 'Trial period end date'
                                },
                                features: {
                                    bsonType: 'object',
                                    properties: {
                                        maxCharts: { bsonType: 'int', minimum: 0 },
                                        maxReports: { bsonType: 'int', minimum: 0 },
                                        advancedAnalysis: { bsonType: 'bool' },
                                        prioritySupport: { bsonType: 'bool' },
                                        exportFormats: {
                                            bsonType: 'array',
                                            items: { enum: ['pdf', 'html', 'json', 'csv'] }
                                        }
                                    }
                                },
                                paymentInfo: {
                                    bsonType: 'object',
                                    properties: {
                                        customerId: { bsonType: 'string' },
                                        subscriptionId: { bsonType: 'string' },
                                        lastPaymentDate: { bsonType: 'date' },
                                        nextPaymentDate: { bsonType: 'date' },
                                        amount: { bsonType: 'double', minimum: 0 },
                                        currency: { bsonType: 'string', maxLength: 3 }
                                    }
                                }
                            }
                        },
                        authentication: {
                            bsonType: 'object',
                            properties: {
                                emailVerified: {
                                    bsonType: 'bool',
                                    description: 'Email verification status'
                                },
                                emailVerificationToken: {
                                    bsonType: 'string',
                                    description: 'Email verification token'
                                },
                                emailVerificationExpires: {
                                    bsonType: 'date',
                                    description: 'Email verification token expiry'
                                },
                                passwordResetToken: {
                                    bsonType: 'string',
                                    description: 'Password reset token'
                                },
                                passwordResetExpires: {
                                    bsonType: 'date',
                                    description: 'Password reset token expiry'
                                },
                                twoFactorEnabled: {
                                    bsonType: 'bool',
                                    description: '2FA enabled status'
                                },
                                twoFactorSecret: {
                                    bsonType: 'string',
                                    description: '2FA secret key'
                                },
                                lastLogin: {
                                    bsonType: 'date',
                                    description: 'Last login timestamp'
                                },
                                loginAttempts: {
                                    bsonType: 'int',
                                    minimum: 0,
                                    description: 'Failed login attempt count'
                                },
                                lockUntil: {
                                    bsonType: 'date',
                                    description: 'Account lock expiry time'
                                },
                                refreshTokens: {
                                    bsonType: 'array',
                                    items: {
                                        bsonType: 'object',
                                        properties: {
                                            token: { bsonType: 'string' },
                                            createdAt: { bsonType: 'date' },
                                            expiresAt: { bsonType: 'date' },
                                            deviceInfo: { bsonType: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        preferences: {
                            bsonType: 'object',
                            properties: {
                                language: {
                                    bsonType: 'string',
                                    enum: ['en', 'hi', 'es', 'fr', 'de', 'pt', 'ru', 'zh'],
                                    description: 'Preferred language'
                                },
                                astroSystem: {
                                    enum: ['vedic', 'western', 'both'],
                                    description: 'Preferred astrological system'
                                },
                                chartStyle: {
                                    enum: ['north_indian', 'south_indian', 'east_indian', 'western'],
                                    description: 'Chart display style'
                                },
                                notifications: {
                                    bsonType: 'object',
                                    properties: {
                                        email: { bsonType: 'bool' },
                                        sms: { bsonType: 'bool' },
                                        push: { bsonType: 'bool' },
                                        newsletter: { bsonType: 'bool' },
                                        transits: { bsonType: 'bool' },
                                        reports: { bsonType: 'bool' }
                                    }
                                },
                                privacy: {
                                    bsonType: 'object',
                                    properties: {
                                        profileVisible: { bsonType: 'bool' },
                                        chartsVisible: { bsonType: 'bool' },
                                        shareData: { bsonType: 'bool' },
                                        analyticsOptIn: { bsonType: 'bool' }
                                    }
                                },
                                display: {
                                    bsonType: 'object',
                                    properties: {
                                        theme: { enum: ['light', 'dark', 'auto'] },
                                        timezone: { bsonType: 'string' },
                                        dateFormat: { enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                                        timeFormat: { enum: ['12h', '24h'] }
                                    }
                                }
                            }
                        },
                        usage: {
                            bsonType: 'object',
                            properties: {
                                chartsGenerated: {
                                    bsonType: 'int',
                                    minimum: 0,
                                    description: 'Total charts generated'
                                },
                                reportsGenerated: {
                                    bsonType: 'int',
                                    minimum: 0,
                                    description: 'Total reports generated'
                                },
                                lastChartDate: {
                                    bsonType: 'date',
                                    description: 'Last chart generation date'
                                },
                                lastReportDate: {
                                    bsonType: 'date',
                                    description: 'Last report generation date'
                                },
                                monthlyUsage: {
                                    bsonType: 'object',
                                    properties: {
                                        charts: { bsonType: 'int', minimum: 0 },
                                        reports: { bsonType: 'int', minimum: 0 },
                                        month: { bsonType: 'string' }, // YYYY-MM format
                                        resetDate: { bsonType: 'date' }
                                    }
                                }
                            }
                        },
                        status: {
                            enum: ['active', 'inactive', 'suspended', 'deleted'],
                            description: 'Account status'
                        },
                        roles: {
                            bsonType: 'array',
                            items: {
                                enum: ['user', 'astrologer', 'admin', 'moderator']
                            },
                            description: 'User roles'
                        },
                        metadata: {
                            bsonType: 'object',
                            properties: {
                                registrationSource: {
                                    bsonType: 'string',
                                    description: 'How user registered (web, mobile, api)'
                                },
                                referralCode: {
                                    bsonType: 'string',
                                    description: 'Referral code used during registration'
                                },
                                ipAddress: {
                                    bsonType: 'string',
                                    description: 'Registration IP address'
                                },
                                userAgent: {
                                    bsonType: 'string',
                                    description: 'User agent during registration'
                                },
                                tags: {
                                    bsonType: 'array',
                                    items: { bsonType: 'string' },
                                    description: 'User tags for segmentation'
                                }
                            }
                        },
                        createdAt: {
                            bsonType: 'date',
                            description: 'Account creation timestamp'
                        },
                        updatedAt: {
                            bsonType: 'date',
                            description: 'Last update timestamp'
                        },
                        deletedAt: {
                            bsonType: 'date',
                            description: 'Soft deletion timestamp'
                        }
                    }
                }
            }
        });

        // Create indexes for performance and uniqueness
        const userCollection = db.collection('users');

        // Unique indexes
        await userCollection.createIndex(
            { email: 1 },
            {
                unique: true,
                name: 'email_unique',
                partialFilterExpression: { deletedAt: { $exists: false } }
            }
        );

        // Performance indexes
        await userCollection.createIndex(
            { 'subscription.type': 1, status: 1 },
            { name: 'subscription_status_idx' }
        );

        await userCollection.createIndex(
            { 'authentication.emailVerified': 1 },
            { name: 'email_verified_idx' }
        );

        await userCollection.createIndex(
            { 'authentication.lastLogin': 1 },
            { name: 'last_login_idx' }
        );

        await userCollection.createIndex(
            { createdAt: 1 },
            { name: 'created_at_idx' }
        );

        await userCollection.createIndex(
            { 'authentication.passwordResetToken': 1 },
            {
                name: 'password_reset_token_idx',
                sparse: true,
                expireAfterSeconds: 3600 // 1 hour TTL
            }
        );

        await userCollection.createIndex(
            { 'authentication.emailVerificationToken': 1 },
            {
                name: 'email_verification_token_idx',
                sparse: true,
                expireAfterSeconds: 86400 // 24 hours TTL
            }
        );

        // Compound indexes for complex queries
        await userCollection.createIndex(
            { status: 1, 'subscription.type': 1, createdAt: -1 },
            { name: 'status_subscription_created_idx' }
        );

        await userCollection.createIndex(
            { roles: 1, status: 1 },
            { name: 'roles_status_idx' }
        );

        // Text index for search functionality
        await userCollection.createIndex(
            {
                'profile.firstName': 'text',
                'profile.lastName': 'text',
                'profile.displayName': 'text',
                email: 'text'
            },
            {
                name: 'user_search_idx',
                weights: {
                    'profile.displayName': 10,
                    'profile.firstName': 5,
                    'profile.lastName': 5,
                    email: 1
                }
            }
        );

        // Geospatial index for location-based queries
        await userCollection.createIndex(
            { 'profile.location': '2dsphere' },
            {
                name: 'location_geo_idx',
                sparse: true
            }
        );

        console.log('Users table created successfully with all indexes');

        // Insert default admin user if specified
        if (process.env.CREATE_DEFAULT_ADMIN === 'true') {
            await this.createDefaultAdmin(userCollection);
        }
    },

    /**
     * Rollback the migration
     */
    async down(db) {
        console.log('Dropping users table...');

        try {
            await db.collection('users').drop();
            console.log('Users table dropped successfully');
        } catch (error) {
            if (error.code === 26) { // Collection doesn't exist
                console.log('Users table already doesn\'t exist');
            } else {
                throw error;
            }
        }
    },

    /**
     * Create default admin user
     */
    async createDefaultAdmin(userCollection) {
        const bcrypt = require('bcrypt');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@jyotish-shastra.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin already exists
        const existingAdmin = await userCollection.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Default admin user already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // Create admin user
        const adminUser = {
            email: adminEmail,
            password: hashedPassword,
            profile: {
                firstName: 'System',
                lastName: 'Administrator',
                displayName: 'Admin'
            },
            subscription: {
                type: 'enterprise',
                status: 'active',
                features: {
                    maxCharts: -1, // Unlimited
                    maxReports: -1, // Unlimited
                    advancedAnalysis: true,
                    prioritySupport: true,
                    exportFormats: ['pdf', 'html', 'json', 'csv']
                }
            },
            authentication: {
                emailVerified: true,
                loginAttempts: 0
            },
            preferences: {
                language: 'en',
                astroSystem: 'vedic',
                chartStyle: 'north_indian',
                notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    newsletter: false,
                    transits: true,
                    reports: true
                },
                privacy: {
                    profileVisible: false,
                    chartsVisible: false,
                    shareData: false,
                    analyticsOptIn: false
                }
            },
            usage: {
                chartsGenerated: 0,
                reportsGenerated: 0,
                monthlyUsage: {
                    charts: 0,
                    reports: 0,
                    month: new Date().toISOString().substring(0, 7),
                    resetDate: new Date()
                }
            },
            status: 'active',
            roles: ['user', 'admin'],
            metadata: {
                registrationSource: 'migration',
                tags: ['admin', 'system']
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await userCollection.insertOne(adminUser);
        console.log(`Default admin user created with email: ${adminEmail}`);
        console.log('Please change the default password after first login');
    },

    /**
     * Validate migration
     */
    async validate(db) {
        const userCollection = db.collection('users');

        // Check if collection exists
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length === 0) {
            throw new Error('Users collection was not created');
        }

        // Check indexes
        const indexes = await userCollection.indexes();
        const expectedIndexes = [
            'email_unique',
            'subscription_status_idx',
            'email_verified_idx',
            'last_login_idx',
            'created_at_idx',
            'password_reset_token_idx',
            'email_verification_token_idx',
            'status_subscription_created_idx',
            'roles_status_idx',
            'user_search_idx',
            'location_geo_idx'
        ];

        const indexNames = indexes.map(idx => idx.name);
        const missingIndexes = expectedIndexes.filter(name => !indexNames.includes(name));

        if (missingIndexes.length > 0) {
            throw new Error(`Missing indexes: ${missingIndexes.join(', ')}`);
        }

        console.log('Users table migration validation passed');
        return true;
    }
};

module.exports = migration;
