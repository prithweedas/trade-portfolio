"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const app = fastify_1.default({
    logger: true
});
app.get('/', (_, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.send({
        x: 'acac'
    });
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app.listen(3000);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
});
start();
//# sourceMappingURL=index.js.map