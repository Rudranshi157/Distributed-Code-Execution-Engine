const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const register  = async (req, res)=> {
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }catch(error){
        console.error("Registration error: ", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message: "User doesn't exists"
            });
        }
        const validate = await bcrypt.compare(password, user.password);
        if(!validate){
            return res.status(401).json({
                message: "Incorrect details"
            });
        }
        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: "Login successful",
            token
        });
    }catch(error){
        console.error("Login error: ", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
    
}

module.exports = {register, login};