import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";

export const getAllUser = async (req, res) => {
    const users = await User.find({});

    HttpMethodStatus.ok(res, 'get Users success' ,users)
}
