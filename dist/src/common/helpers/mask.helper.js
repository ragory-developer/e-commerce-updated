"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskPhone = maskPhone;
exports.maskEmail = maskEmail;
function maskPhone(phone) {
    if (phone.length < 7)
        return '****';
    return `${phone.substring(0, 4)}****${phone.substring(phone.length - 3)}`;
}
function maskEmail(email) {
    const [local, domain] = email.split('@');
    if (!local || !domain)
        return '***@***';
    const visible = local.length > 2 ? local.substring(0, 2) : local[0];
    return `${visible}****@${domain}`;
}
//# sourceMappingURL=mask.helper.js.map