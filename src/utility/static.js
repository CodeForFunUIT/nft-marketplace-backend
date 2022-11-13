class HttpMethodStatus {
    static ok (res, message, data) {
        res.status(200).send({success: true,message: message, data: data})
    }
    static created (res, message, data) {
        res.status(201).send({success: true,message: message, data: data})
    }
    static badRequest (res, message) {
        res.status(400).send({success: false,message: message})
    }
    static unAuthenticated (res, message) {
        res.status(401).send({success: false,message: message})
    }
    static forbidden (res, message) {
        res.status(403).send({success: false,message: message})
    }
    static internalServerError (res, message) {
        res.status(500).send({success: false,message: message})
    }

}

export default HttpMethodStatus;
