declare class CheckoutAddressDto {
    street: string;
    streetNumber: string;
    locality: string;
    city: string;
    postalCode: string;
    province: string;
    instructions?: string;
}
declare class CheckoutShippingDto {
    idClub: number;
    idCourier: number;
}
export declare class CheckoutCartDto {
    paymentMethod: string;
    address: CheckoutAddressDto;
    shipping?: CheckoutShippingDto[];
}
export {};
