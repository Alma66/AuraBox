export declare class CreateProductInventoryDto {
    idClub: number;
    idSupplyCategory: number;
    idSupplier?: number;
    name: string;
    description?: string;
    unitType: string;
    currentStock?: number;
    minStock?: number;
    costPerUnit?: number;
    active?: boolean;
}
