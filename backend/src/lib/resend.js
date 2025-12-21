import {Resend} from "resend"
import {ENV} from "./env.js"


export const resendClient=new Resend(ENV.API_KEY)

export const sender={
    email:ENV.EMAIL_FROM,
    name:ENV.EMAIL_FROM_NAME
}