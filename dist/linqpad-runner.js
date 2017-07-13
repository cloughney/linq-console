"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var child_process_1 = require("child_process");
var RunType;
(function (RunType) {
    RunType[RunType["expression"] = 0] = "expression";
    RunType[RunType["statements"] = 1] = "statements";
    RunType[RunType["program"] = 2] = "program";
})(RunType || (RunType = {}));
var LinqPadRunner = (function () {
    function LinqPadRunner(exePath) {
        this.exePath = exePath;
    }
    LinqPadRunner.prototype.runExpression = function (input, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        return [4, this.executeCommand(RunType.expression, input)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    LinqPadRunner.prototype.runStatements = function (input, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        return [4, this.executeCommand(RunType.statements, input)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    LinqPadRunner.prototype.runProgram = function (input, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        return [4, this.executeCommand(RunType.program, input)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    LinqPadRunner.prototype.createScriptFile = function (script) {
        return new Promise(function (resolve) {
            var filePath = path.join(process.env['TEMP'], "linqpad-console." + Date.now() + ".txt");
            fs.writeFile(filePath, script, function (err) {
                if (err)
                    throw err;
                resolve(filePath);
            });
        });
    };
    LinqPadRunner.prototype.destroyScriptFile = function (filePath) {
        return new Promise(function (resolve) {
            fs.unlink(filePath, function (err) {
                if (err)
                    throw err;
                resolve();
            });
        });
    };
    LinqPadRunner.prototype.executeCommand = function (runType, input) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var filePath, langArg, lprun, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.createScriptFile(input)];
                    case 1:
                        filePath = _a.sent();
                        langArg = this.resolveLangArgument(runType);
                        lprun = child_process_1.spawn(this.exePath, [langArg, filePath]);
                        buffer = [];
                        lprun.stdout.on('data', function (data) { buffer.push(data); });
                        lprun.stderr.on('data', function (data) { buffer.push(data); });
                        lprun.on('close', function (code) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.destroyScriptFile(filePath)];
                                    case 1:
                                        _a.sent();
                                        resolve({
                                            output: buffer.join(''),
                                            success: code === 0
                                        });
                                        return [2];
                                }
                            });
                        }); });
                        return [2];
                }
            });
        }); });
    };
    LinqPadRunner.prototype.resolveLangArgument = function (runType) {
        switch (runType) {
            case RunType.expression: return '-lang=e';
            case RunType.statements: return '-lang=s';
            case RunType.program: return '-lang=p';
            default: throw new Error('Cannot resolve run type.');
        }
    };
    return LinqPadRunner;
}());
exports.default = LinqPadRunner;
