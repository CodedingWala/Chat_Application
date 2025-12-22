import aj from "../lib/arcjet.js"
import { isSpoofedBot } from "@arcjet/inspect"

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req)
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "too many requests" })
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({ message: "bot detected" })
            }
            else {
                return res.status(403).json({ message: "access denied" })
            }
        }

        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                error: "spoofed bot detected",
                message: "malacious activity detected"
            })
        }

        next()

    } catch (error) {
        console.log("some error occured inside the arcjet protection middleware: ", error.message)
        next()
    }
}