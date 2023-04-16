class HttpMethodStatus {
    constructor() {
        this.message = 'I am an instance';
    }
    ok(res, message, data) {
        res.status(200).send({success: true,message: message, data: data})
    }
    created (res, message, data) {
        res.status(201).send({success: true,message: message, data: data})
    }
    badRequest (res, message) {
        res.status(400).send({success: false,message: message})
    }
    unAuthenticated (res, message) {
        res.status(401).send({success: false,message: message})
    }
    forbidden (res, message) {
        res.status(403).send({success: false,message: message})
    }
    internalServerError (res, message) {
        res.status(500).send({success: false,message: message})
    }
}
export default new HttpMethodStatus();