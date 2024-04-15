const jwt = require('jsonwebtoken');

exports.jwtMiddleware = (req, res,next) =>{
  
    const token = req.headers.authorization?.split(' ')[1];
     
    if(token){
        jwt.verify(token,  process.env.JWT_SECRET, (err, decode)=> {
            if (err) return res.status(401).send("Invalid Token")
            req.user = decode;
            next();
        });
    }
    else {
        res.status(401).send("No token Provided");
    }
}
