const router = require("express").Router();
//require("dotenv").config({ path: "../../../" });
const User = require("../../models/user.model");

router.route("/").post((req, res) => {
  let { password } = req.body;

  let { email } = req.body;

  if (!email) {
    return res.status(400).send({
      success: false,
      message: "Email obrigatório",
    });
  }

  if (!password) {
    return res.status(400).send({
      success: false,
      message: "Password obrigatória",
    });
  }

  email = email.toLowerCase();
  User.find(
    {
      email: email,
    },
    (err, users) => {
      if (err) {
        return res.status(400).send({
          success: false,
          message: "Pedido mal efetuado!",
        });
      }
      if (users.length != 1) {
        return res.status(404).send({
          success: false,
          message: "Combinação de Email e Password inválido",
        });
      }

      const user = users[0];
      /*
        if (!person.validPassword(password)){
            return res.send({
                'message': 'Erro: Inválido'
            })
        }
      */

      if (user.isInactive) {
        return res.status(401).send({
          success: false,
          message:
            "A sua conta encontra-se inativa. Por favor confirme o seu email.\n" +
            "Em caso de problemas, entre em contacto com um dos nosso administradores.",
        });
      }

      user.isMatchPassword(password, user.password, (err, isMatch) => {
        if (!isMatch) {
          return res.status(404).send({
            success: false,
            message: "Combinação de Email e Password inválidos",
          });
        }
        let token = user.generateAuthToken("1h");
        return res
          .cookie("token", token)
          .status(200)
          .send({ success: true, message: "Logado com sucesso!", user: user });
      });
    }
  );
});

module.exports = router;
