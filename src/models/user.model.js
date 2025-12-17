import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },  
    fullName: {
        type: String,
        required: true,
        
        
    }, 
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
     password: {
        type: String,
        required: true,
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "Video"

    }

},{timestamps:true});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return ; // new update next() not needed

    this.password = await bcrypt.hash(this.password,10);
      
})

userSchema.methods.isPasswordCorrect= async function (password) {
   return await bcrypt.compare(this.password,password);
}
userSchema.methods.generateAccessToken= function() {
 return   jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }

)
}

userSchema.methods.generateRefreshToken= function() {
    return   jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }

)
}

export const User = mongoose.model("User",userSchema);