var config = require("../config");
var ejs = require("ejs");
var sgMail = require("@sendgrid/mail");
const router = require("express").Router();
//require('dotenv').config({path:'../../'});
sgMail.setApiKey(config.sendGridApiKey);

var subjects = {
  accountConfirmation: "Confirmação de conta em VolunteeringIPS",
  accountCreation: "Conta criada em VolunteeringIPS",
  accountRemoval: "Conta removida em VolunteeringIPS",
  resetPassword: "Renovação de Palavra-Passe em VolunteeringIPS",
  volunteeringStatus: "Estado de voluntariado em VolunteeringIPS",
  volunteeringApplication: "Candidatura a voluntariado em VolunteeringIPS",
  volunteeringApplicationStatus:
    "Resposta de candidatura ao voluntariado em VolunteeringIPS",
  volunteeringProposal: "Proposta de voluntariado submetida em VolunteeringIPS",
  volunteeringProposalStatus:
    "Resposta de proposta de voluntariado enviada em VolunteeringIPS",
  volunteeringRemovedUser: "Remoção do Voluntariado em VolunteeringIPS",
  volunteeringRecruit: "Convite para o VolunteeringIPS ",
  raffleWinner: "Vencedor de sorteio no VolunteeringIPS"
};

async function isSendedEmail(action, params, recipient) {
  try {
    var email = {
      to: recipient,
      from: {
        email: config.emailAddress,
        name: "VolunteeringIPS",
      },
    };

    // Get email subject
    email.subject = subjects[action];

    // Get email html
    email.html = await ejs.renderFile(
      __dirname + "/templates/" + action + ".ejs",
      { params: params }
    );

    var sent = false;

    // Send email
    await sgMail
      .send(email)
      .then(async (res) => {
        sent = true;
      })
      .catch(async (err) => {});

    return sent;
  } catch (err) {
    return false;
  }
}

router.post("/notify", async (req, res) => {
  try {
    if (req.body.auth === config.authKey) {
      if (
        req.body.action !== undefined &&
        req.body.params !== undefined &&
        req.body.recipient !== undefined
      ) {
        const sent = await isSendedEmail(
          req.body.action,
          req.body.params,
          req.body.recipient
        );
        if (sent)
          return res.status(200).send("Notificação enviada com sucesso");
        else
          return res.status(409).send("Não foi possivel enviar a notificação");
      }
    } else {
      return res.status(401).send("Authentication failed");
    }
    return res.status(400).send("Bad request");
  } catch (error) {}
});

module.exports = router;
module.exports.isSendedEmail = isSendedEmail;
