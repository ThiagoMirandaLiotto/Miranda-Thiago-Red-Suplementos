import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export default function parseId(value) {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return Number(value);
}
