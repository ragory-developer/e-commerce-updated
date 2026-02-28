export declare class CustomerRequestOtpDto {
    phone: string;
}
export declare class CustomerVerifyRegistrationOtpDto {
    phone: string;
    code: string;
}
export declare class RegisterAddressDto {
    label?: string;
    address: string;
    descriptions?: string;
    city: string;
    state: string;
    road?: string;
    zip: string;
    country: string;
}
export declare class CustomerCompleteRegistrationDto {
    registrationToken: string;
    firstName: string;
    lastName: string;
    email?: string;
    password: string;
    address?: RegisterAddressDto;
    deviceId?: string;
    deviceName?: string;
    deviceType?: string;
}
export declare class CustomerPasswordLoginDto {
    phone: string;
    password: string;
    deviceId?: string;
    deviceName?: string;
    deviceType?: string;
}
export declare class CustomerOtpLoginRequestDto {
    phone: string;
}
export declare class CustomerOtpLoginVerifyDto {
    phone: string;
    code: string;
    deviceId?: string;
    deviceName?: string;
    deviceType?: string;
}
export declare class VerifyPhoneRequestDto {
    phone: string;
}
export declare class VerifyPhoneConfirmDto {
    phone: string;
    code: string;
}
export declare class ForgotPasswordDto {
    phone: string;
}
export declare class ResetPasswordDto {
    phone: string;
    code: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
    deviceId?: string;
}
export declare class LogoutDto {
    refreshToken: string;
}
