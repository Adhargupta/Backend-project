import mongoose, {Schema} from 'mongoose'

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,                  // subscribers are the users too
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,                                      // The channel owner is also an user
        ref: "User"
    }
},{timestamps:true})

export const Subscription = mongoose.model('subscription', subscriptionSchema)