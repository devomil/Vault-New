"use strict";
// Common utility types and interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.Priority = exports.Status = void 0;
// Status enums
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
    Status["PENDING"] = "pending";
    Status["SUSPENDED"] = "suspended";
    Status["DELETED"] = "deleted";
})(Status || (exports.Status = Status = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["CRITICAL"] = "critical";
})(Priority || (exports.Priority = Priority = {}));
//# sourceMappingURL=common.js.map