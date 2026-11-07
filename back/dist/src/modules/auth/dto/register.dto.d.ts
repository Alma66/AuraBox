export declare class RegisterCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: string;
    documentNumber: string;
    phoneNumber?: string | null;
    birthDate: string;
    acceptedRuleIds?: number[];
}
export declare class RegisterEntrepreneurDto extends RegisterCustomerDto {
    city?: string;
    province?: string;
}
export declare class CompleteCustomerProfileDto {
    profileToken: string;
    streetAddress?: string;
    addressNumber?: number;
    floorNumber?: string;
    addressDetails?: string;
    city?: string;
    province?: string;
    postalCode?: string;
}
export declare class CreateClubDto {
    name: string;
    shortDescription: string;
    contactEmail: string;
    slogan?: string;
    history?: string;
    whatsappContact?: string;
    logoUrl?: string;
}
export declare class RegisterClubDto extends CreateClubDto {
    entrepreneurToken: string;
}
