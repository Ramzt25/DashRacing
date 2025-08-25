export interface VehicleSearchParams {
    make?: string;
    model?: string;
    year?: number;
    limit?: number;
}
export interface VehicleBasicInfo {
    id: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    submodel?: string;
    niceName: string;
}
export interface VehicleDetails {
    id: string;
    make: string;
    model: string;
    year: number;
    trim: string;
    submodel: string;
    niceName: string;
    description: string;
    msrp: number;
    invoice: number;
    tmv: number;
    drivetrain: string;
    engine: {
        type: string;
        cylinders: number;
        displacement: number;
        horsepower: number;
        torque: number;
        fuelType: string;
    };
    transmission: {
        type: string;
        gears: number;
    };
    fuelEconomy: {
        city: number;
        highway: number;
        combined: number;
    };
    dimensions: {
        length: number;
        width: number;
        height: number;
        wheelbase: number;
        groundClearance: number;
    };
    weight: {
        curb: number;
        gross: number;
    };
    capacity: {
        seating: number;
        cargo: number;
        fuel: number;
    };
    safety: {
        overallRating: number;
        nhtsa?: number;
        iihs?: string;
    };
}
export interface VehicleTrim extends VehicleBasicInfo {
    price: {
        baseMSRP: number;
        baseInvoice: number;
        deliveryCharges: number;
    };
    engine: {
        type: string;
        horsepower: number;
        torque: number;
    };
    fuelEconomy: {
        city: number;
        highway: number;
        combined: number;
    };
}
export interface VehiclePricing {
    vehicleId: string;
    make: string;
    model: string;
    year: number;
    trim: string;
    msrp: number;
    invoice: number;
    tmv: number;
    incentives: Array<{
        name: string;
        amount: number;
        description: string;
        eligibility: string;
    }>;
    regionalAdjustment: number;
    totalWithIncentives: number;
    estimatedMonthlyPayment: {
        lease: number;
        finance: number;
    };
}
export declare class EdmundsApiService {
    private static readonly API_KEY;
    private static readonly BASE_URL;
    /**
     * Search for vehicles based on criteria
     */
    static searchVehicles(params: VehicleSearchParams): Promise<VehicleBasicInfo[]>;
    /**
     * Get detailed vehicle information
     */
    static getVehicleDetails(make: string, model: string, year: number): Promise<VehicleDetails | null>;
    /**
     * Get vehicle trims for a specific make/model/year
     */
    static getVehicleTrims(make: string, model: string, year: number): Promise<VehicleTrim[]>;
    /**
     * Get vehicle pricing information
     */
    static getVehiclePricing(make: string, model: string, year: number, trim?: string, zip?: string): Promise<VehiclePricing | null>;
    /**
     * Get vehicle specifications
     */
    static getVehicleSpecifications(make: string, model: string, year: number): Promise<any>;
    /**
     * Get vehicle reviews
     */
    static getVehicleReviews(make: string, model: string, year: number): Promise<any[]>;
    /**
     * Get vehicle recalls
     */
    static getVehicleRecalls(make: string, model: string, year: number): Promise<any[]>;
    /**
     * Compare multiple vehicles
     */
    static compareVehicles(vehicles: Array<{
        make: string;
        model: string;
        year: number;
    }>): Promise<any>;
    /**
     * Get popular vehicles
     */
    static getPopularVehicles(): Promise<VehicleBasicInfo[]>;
    /**
     * Get all vehicle makes
     */
    static getVehicleMakes(): Promise<string[]>;
    /**
     * Get models for a specific make
     */
    static getModelsForMake(make: string): Promise<string[]>;
    private static getMockVehicleSearch;
    private static getMockVehicleDetails;
    private static getMockVehicleTrims;
    private static getMockVehiclePricing;
    private static getMockVehicleSpecifications;
    private static getMockVehicleReviews;
    private static getMockVehicleRecalls;
    private static getMockPopularVehicles;
    private static getMockVehicleMakes;
    private static getMockModelsForMake;
    private static transformVehicleSearchResults;
    private static transformVehicleDetails;
    private static transformVehicleTrims;
    private static transformVehiclePricing;
    private static transformPopularVehicles;
    private static generateComparison;
}
//# sourceMappingURL=EdmundsApiService.d.ts.map