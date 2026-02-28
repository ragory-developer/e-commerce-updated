"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserType = exports.USER_TYPE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.USER_TYPE_KEY = 'userType';
const UserType = (...types) => (0, common_1.SetMetadata)(exports.USER_TYPE_KEY, types);
exports.UserType = UserType;
//# sourceMappingURL=user-type.decorator.js.map