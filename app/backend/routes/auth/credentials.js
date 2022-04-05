var config = require("../../config");
const router = require("express").Router();
//require("dotenv").config({ path: "../../../" });
const axios = require("axios");
const jwt = require("jsonwebtoken");
let User = require("../../models/user.model");
const manageRequests = require("./manageRequests");
const bcrypt = require("bcrypt");
var restrictedRoutes = require("../../restrictedRoutes/restrictedRoutes.js");

router.route("/forgot").post((req, res) => {
  let body = req.body;
  let { email, action } = body;

  /*
  let domainCheck = email.endsWith("ips.pt");

  if (!domainCheck) {
    return res.status(403).json({
      success: false,
      message: "Email não aceito." + " Você deve ser membro da comunidade IPS.",
    });
  }
  */

  User.findOne({ email: email }, (err, collection) => {
    if (!collection)
      return res
        .status(403)
        .json({ success: false, message: "Este email não está registado" });

    let data = {
      auth: config.authKey,
      action: action,
      recipient: email,
      params: {
        firstName: collection.firstName,
        url:
          (config.frontendHostAddress
            ? config.frontendHostAddress
            : config.hostAddress) +
          "/reset/" +
          collection._id,
        //url: "http://localhost:3001/reset/" + collection._id,
      },
    };
    let newRequest = {
      id: collection._id.toString(),
      email: email,
    };
    manageRequests.createRequest(newRequest);
    axios.post(config.hostAddress + "/api/email/notify", data);
    return res.status(200).send({
      success: true,
      message: "Verifique seu email para redefinir sua palavra-passe",
    });
  }).catch((err) => res.status(400).json({ success: false, message: err }));
});

router.route("/reset").patch((req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword)
      return res
        .status(400)
        .send({ success: true, message: "Password não são iguais" });
    let userID = req.body.id;
    let newPassword = req.body.password;
    const requests = manageRequests.getElemRequest(userID);
    let filter = { _id: requests.id };
    bcrypt.hash(newPassword, 10, function (err, hash) {
      if (err) return next(err);
      User.findOneAndUpdate(filter, { password: hash }, (err, user) => {
        if (err)
          return res.status(400).send({ success: true, message: err.message });
        else
          return res.status(200).send({
            success: true,
            message: `Sua password foi atualizada, por favor tente fazer login`,
          });
      }).catch((err) => res.status(400).json({ success: false, message: err }));
    });
  } catch (error) {
    return res.status(400).send({ success: false, message: `Sem pedidos` });
  }
});

router.route("/confirmAccount/:token").get((req, res) => {
  const token = req.params.token;
  if (!token)
    return res.status(400).send({
      success: false,
      message: "Token Inválido!",
    });
  try {
    const user = jwt.verify(token, config.jwtPrivateKey);
    let filter = { _id: user._id };
    User.findOneAndUpdate(filter, { isInactive: false }, function (
      err,
      result
    ) {
      if (err) {
        return res.status(400).send({ success: false, message: err.message });
      } else {
        let fullName = result.firstName + " " + result.lastName;
        res.redirect(
          200,
          (config.frontendHostAddress
            ? config.frontendHostAddress
            : config.hostAddress) +
            "/accountConfirmed/" +
            fullName.toString()
          //return res.redirect(200,"http://localhost:3001/accountConfirmed/" + fullName.toString()
        );
      }
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: err.message,
    });
  }
});

router.route("/isLoggedIn").get((req, res) => {
  // Read the token from the cookie
  const token = req.cookies.token;
  const referer = req.headers.referer.split("/").pop();
  if (!token) {
    if (referer == "auth") return res.status(401).send({ message: "Ignore" });
    else
      return res.status(401).send({
        success: false,
        message: "É necessário fazer login para realizar esta ação",
      });
  }
  try {
    let decoded = jwt.verify(token, config.jwtPrivateKey);
    User.findOne({ _id: decoded._id }, (err, user) => {
      if (err)
        return res.status(400).send({ success: false, message: err.message });
      else {
        if (user.isInactive) {
          res.clearCookie("token");
          return res.status(401).send({
            success: false,
            message:
              "A sua conta encontra-se inativa. Por favor confirme o seu email.\n" +
              "Em caso de problemas, entre em contacto com um dos nosso administradores.",
          });
        }
        //req.user = decoded;
        let token = user.generateAuthToken("1h");
        return res
          .cookie("token", token, { overwrite: true })
          .status(200)
          .send({ success: true, message: "Está logado" });
      }
    });
  } catch (er) {
    //Incase of expired jwt or invalid token kill the token and clear the cookie
    res.clearCookie("token");
    return res.status(400).send({
      success: false,
      message: "A sua sessão expirou ou o token é inválido!",
    });
  }
});

router.route("/hasAccess").get((req, res) => {
  const token = req.cookies.token;
  const referer = req.headers.referer.split("/").pop();
  if (!token) {
    if (referer == "auth") return res.status(401).send({ message: "Ignore" });
    else
      return res.status(401).send({
        success: false,
        message: "É necessário fazer login para realizar esta ação",
      });
  }
  try {
    let decoded = jwt.verify(token, config.jwtPrivateKey);
    User.findOne({ _id: decoded._id }, (err, user) => {
      if (err)
        return res.status(400).send({ success: false, message: err.message });
      else {
        const role = user.role;
        const origin = req.headers.referer.split("/")[2];
        const page = req.headers.referer
          .split(origin)[1]
          .split("/")[1]
          .toLowerCase();
        if (restrictedRoutes[role].includes(page)) {
          return res
            .status(401)
            .send({ success: false, message: "Não tem acesso a esta página" });
        }
        return res
          .status(200)
          .send({ success: true, message: "Access allowed" });
      }
    });
  } catch (er) {
    res.clearCookie("token");
    return res.status(400).send({
      success: false,
      message: "A sua sessão expirou! Por favor, volte a inicar a sessão.",
    });
  }
});

/**
 * This route shouldn't be tested.
 * It only returns true or false wether the user is an Admin or not.
 * Its OKAY if the user is NOT an admin.
 */
router.route("/isAdmin").get((req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).send({ isAdmin: false });
  }
  try {
    let decoded = jwt.verify(token, config.jwtPrivateKey);
    User.findOne({ _id: decoded._id }, (err, user) => {
      if (err) return res.status(200).send({ isAdmin: false });
      else {
        const role = user.role;
        if (role === "NORMAL") {
          return res.status(200).send({ isAdmin: false });
        }
        return res.status(200).send({ isAdmin: true });
      }
    });
  } catch (er) {
    return res.status(200).send({ isAdmin: false });
  }
});

router.route("/logout").get((req, res) => {
  res.clearCookie("token");
  return res
    .status(200)
    .send({ success: true, message: "A sua sessão foi terminada" });
});


module.exports = router;
