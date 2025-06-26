const ComprehensiveReportService = require('../../../src/services/report/ComprehensiveReportService');
const TestChartFactory = require('../../utils/TestChartFactory');

// Mock dependent services
jest.mock('../../../src/services/analysis/LagnaAnalysisService.js');
jest.mock('../../../src/core/analysis/houses/HouseAnalysisService');
jest.mock('../../../src/services/analysis/ArudhaAnalysisService.js');
jest.mock('../../../src/core/analysis/aspects/AspectAnalysisService.js');
jest.mock('../../../src/services/analysis/BirthDataAnalysisService.js');

const LagnaAnalysisService = require('../../../src/services/analysis/LagnaAnalysisService.js');
const HouseAnalysisService = require('../../../src/core/analysis/houses/HouseAnalysisService');
const ArudhaAnalysisService = require('../../../src/services/analysis/ArudhaAnalysisService.js');
const AspectAnalysisService = require('../../../src/core/analysis/aspects/AspectAnalysisService.js');
const BirthDataAnalysisService = require('../../../src/services/analysis/BirthDataAnalysisService.js');

describe('ComprehensiveReportService', () => {
    let service;
    let chart;

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        LagnaAnalysisService.mockClear();
        HouseAnalysisService.mockClear();
        ArudhaAnalysisService.mockClear();
        AspectAnalysisService.mockClear();
        BirthDataAnalysisService.mockClear();

        service = new ComprehensiveReportService();
        chart = TestChartFactory.createChart('Aries');
    });

    it('should generate a comprehensive report', async () => {
        // Mock the return values of the dependent services with complete structures
        LagnaAnalysisService.prototype.analyzeLagna = jest.fn().mockResolvedValue({
            lagnaSign: {
                sign: 'ARIES',
                characteristics: ['dynamic', 'pioneering', 'energetic'],
                element: 'Fire',
                quality: 'Cardinal',
                strengths: ['leadership', 'initiative'],
                challenges: ['impatience', 'aggression']
            },
            lagnaLord: {
                strength: 8,
                house: 1,
                effects: ['strong vitality', 'good health']
            }
        });

        LagnaAnalysisService.prototype.detectStelliums = jest.fn().mockReturnValue([]);
        LagnaAnalysisService.prototype.analyzeHouseClustering = jest.fn().mockReturnValue({});
        LagnaAnalysisService.prototype.analyzePlanetaryConjunctions = jest.fn().mockReturnValue([]);
        LagnaAnalysisService.prototype.analyzeExaltationDebility = jest.fn().mockReturnValue({});
        LagnaAnalysisService.prototype.analyzeAllPlanetaryDignities = jest.fn().mockReturnValue({
            planetaryDignities: {
                sun: { sign: 'LEO', strength: 8, dignity: 'Own Sign' },
                moon: { sign: 'CANCER', strength: 7, dignity: 'Own Sign' },
                mars: { sign: 'ARIES', strength: 9, dignity: 'Own Sign' },
                mercury: { sign: 'GEMINI', strength: 6, dignity: 'Own Sign' },
                jupiter: { sign: 'SAGITTARIUS', strength: 8, dignity: 'Own Sign' },
                venus: { sign: 'TAURUS', strength: 7, dignity: 'Own Sign' },
                saturn: { sign: 'CAPRICORN', strength: 6, dignity: 'Own Sign' }
            }
        });

        HouseAnalysisService.prototype.crossVerifyHouseIndications = jest.fn().mockResolvedValue({
            houseAnalysis: {
                houses: {
                    1: {
                        occupants: { planets: [] },
                        aspects: { aspectingPlanets: [] },
                        detailedAnalysis: { overallAssessment: 'Strong first house' },
                        strength: 8
                    },
                    4: {
                        houseLord: { placement: {} },
                        strength: { score: 6, description: 'Moderate' }
                    }
                }
            },
            houseAnalyses: {
                1: {
                    occupants: { planets: [] },
                    aspects: { aspectingPlanets: [] },
                    detailedAnalysis: { overallAssessment: 'Strong first house' },
                    strength: 8
                },
                2: {
                    significations: {
                        specificAnalysis: {
                            wealth: { prospects: [], assessment: 'Good wealth prospects' },
                            family: { background: [], assessment: 'Supportive family' }
                        }
                    },
                    occupants: { planets: [] },
                    houseLord: {
                        condition: {
                            strength: {
                                score: 7,
                                description: 'Strong'
                            }
                        }
                    },
                    strength: 7
                },
                4: {
                    houseLord: {
                        placement: {}
                    },
                    strength: {
                        score: 6,
                        description: 'Moderate'
                    }
                },
                5: {
                    significations: {
                        specificAnalysis: {
                            education: { path: [], assessment: 'Good education prospects' }
                        }
                    },
                    occupants: { planets: [] },
                    houseLord: {
                        condition: {
                            strength: {
                                score: 6,
                                description: 'Moderate'
                            }
                        }
                    },
                    strength: 6
                },
                6: {
                    significations: {
                        specificAnalysis: {
                            health: { challenges: [], assessment: 'Moderate health' }
                        }
                    },
                    occupants: { planets: [] },
                    houseLord: { placement: {} },
                    challenges: [],
                    strength: 5
                },
                7: {
                    significations: {
                        specificAnalysis: {
                            marriage: { prospects: [], assessment: 'Good marriage prospects' },
                            partnerships: { ability: [], assessment: 'Good partnership ability' }
                        }
                    },
                    occupants: { planets: [] },
                    houseLord: {
                        condition: {
                            strength: {
                                score: 6,
                                description: 'Moderate'
                            }
                        }
                    },
                    aspects: { aspectingPlanets: [] },
                    strength: 6
                },
                8: {
                    significations: {
                        specificAnalysis: {
                            longevity: { factors: [], assessment: 'Good longevity' },
                            transformation: { potential: [], assessment: 'Transformation potential' }
                        }
                    },
                    challenges: [],
                    strength: 5
                },
                9: {
                    significations: {
                        specificAnalysis: {
                            spirituality: { inclination: [], assessment: 'Spiritual inclination' },
                            father: { relation: [], assessment: 'Good father relation' },
                            luck: { factors: [], assessment: 'Good luck factors' }
                        }
                    },
                    strength: 7
                },
                10: {
                    significations: {
                        specificAnalysis: {
                            career: { path: [], assessment: 'Good career prospects' },
                            status: { prospects: [], assessment: 'Good status prospects' },
                            authority: { qualities: [], assessment: 'Leadership qualities' }
                        }
                    },
                    occupants: { planets: [] },
                    houseLord: { placement: {} },
                    strength: 7
                },
                11: {
                    significations: {
                        specificAnalysis: {
                            gains: { prospects: [], assessment: 'Good gain prospects' },
                            income: { streams: [], assessment: 'Multiple income streams' },
                            friends: { patterns: [], assessment: 'Good friendships' }
                        }
                    },
                    houseLord: { placement: {} },
                    strength: 6
                },
                12: {
                    challenges: [],
                    strength: 4
                }
            }
        });

        ArudhaAnalysisService.prototype.calculateArudhaLagna = jest.fn().mockResolvedValue({
            publicImageAnalysis: {
                arudhaSign: 'LEO',
                publicImageTraits: ['charismatic', 'confident'],
                signCharacteristics: {
                    traits: ['leadership', 'creativity']
                },
                reputationFactors: ['strong public presence'],
                materialManifestation: 'Luxurious lifestyle',
                socialStanding: 'High social status'
            },
            comparison: {
                areSame: false,
                difference: 'Lagna and Arudha are different',
                implications: ['different public and private personas'],
                detailedAnalysis: {
                    harmonizationSuggestions: ['align public and private image']
                }
            }
        });

        AspectAnalysisService.prototype.analyzeAllAspects = jest.fn().mockResolvedValue({
            wealthYogas: {
                dhanaYogas: [],
                lakshmiYogas: [],
                aspectConnections: [],
                overallWealth: {}
            }
        });

        BirthDataAnalysisService.prototype.analyzeBirthDataCollection = jest.fn().mockReturnValue({});

        const report = await service.generateComprehensiveReport(chart);

        expect(report).toBeDefined();
        expect(report).toHaveProperty('sections');
        expect(report.sections).toHaveProperty('personality');
        expect(report.sections).toHaveProperty('health');
        expect(report.sections).toHaveProperty('educationCareer');
        expect(report.sections).toHaveProperty('financial');
        expect(report.sections).toHaveProperty('relationships');
        expect(report.sections).toHaveProperty('lifePredictions');
    });
});
