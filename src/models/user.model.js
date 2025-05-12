import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({


    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // to create an index on this field for faster search queries in an optimized way 


    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,



    },
    fullname: {
        type: String,
        required: true,


        trim: true,
        index: true // to create an index on this field for faster search queries in an optimized way 


    },
    avatar: {
        type: String, // cloudinary URL for the user's avatar
        required: true,



    },
    coverImage: {
        type: String, // cloudinary URL

    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],



    },
    refreshToken: {
        type: String,


    }





}, { timestamps: true }) // to automatically add createdAt and updatedAt fields to the schema



userSchema.pre("save",async function(next){  // mongoose middleware 
    if(!this.isModified("password")) return next(); // because if password is not modified, then we don't want to hash it again 

    
    this.password = await bcrypt.hash(this.password,10) // suppose user changes the avatar and resave it then we dont want to hash the password again, so we just return next()
    next();
}) // here we dont use callback because callbacks dont have any context

userSchema.methods.isPasswordCorrect = async function(password){ // mongoose methods
   return await   bcrypt.compare(password , this.password) // this.password is hashed password in database
}

userSchema.methods.generateAccessToken = function(){
        return   jwt.sign(
            {
               _id:  this._id,
               email : this.email,
               username : this.username,
               fullname : this.fullname // all this.data here data comes from database


            },
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }


          )
}

userSchema.methods.generateRefreshToken = function(){

     return   jwt.sign(
            {
               _id:  this._id,
              


            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn : process.env.REFRESH_TOKEN_EXPIRY
            }


          )
    
}

export const User = mongoose.model('User', userSchema) 
