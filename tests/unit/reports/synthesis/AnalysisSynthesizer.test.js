const { synthesizeAnalysis, synthesizeAnalyses } = require('../../../../src/core/reports/synthesis/AnalysisSynthesizer');

describe('AnalysisSynthesizer', () => {

    it('should synthesize analysis results', () => {
        const analysisResults = {
            lagnaAnalysis: {
                summary: 'You are a dynamic and assertive individual.'
            },
            luminariesAnalysis: {
                sunAnalysis: {
                    summary: 'Your sun sign indicates a strong will and leadership qualities.'
                },
                moonAnalysis: {
                    summary: 'Your moon sign suggests a nurturing and emotional nature.'
                }
            },
            houseAnalysis: {},
            aspectAnalysis: {},
            dashaAnalysis: {},
            navamsaAnalysis: {},
            arudhaAnalysis: {},
            yogaAnalysis: {}
        };

        const synthesis = synthesizeAnalysis(analysisResults);

        expect(synthesis).toBeDefined();
        expect(synthesis.personality).toBeDefined();
        expect(synthesis.health).toBeDefined();
        expect(synthesis.career).toBeDefined();
        expect(synthesis.financial).toBeDefined();
        expect(synthesis.relationships).toBeDefined();
        expect(synthesis.predictions).toBeDefined();
    });
});
