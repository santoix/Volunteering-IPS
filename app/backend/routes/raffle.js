var config = require("../config");
const router = require("express").Router();
const Raffle = require("../models/raffle.model");
const User = require("../models/user.model");
const moment = require("moment");
const axios = require("axios");
moment.locale("pt");

router.route("/").post(async (req, res) => {
  const newRaffle = new Raffle(req.body);

  if (!newRaffle.name) {
    return res
      .status(400)
      .json({ success: false, message: "Deve ter um nome" });
  } else if (!newRaffle.participationEndDateTime) {
    return res
      .status(400)
      .json({ success: false, message: "Deve indicar uma data de fim" });
  } else if (newRaffle.isInactive === null || undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Deve indicar se está inativo ou não" });
  } else {
    newRaffle.save(function (err, raffle) {
      if (err) {
        if (err.name == "ValidationError")
          return res.status(400).send({
            success: false,
            message: "Erro ao guardar os dados. " + err.message,
          });
        else
          return res.status(400).send({
            success: false,
            message: "Erro ao guardar os dados. Código do erro: " + err.code,
          });
      }

      return res.status(201).json({
        raffleID: raffle._id,
        success: true,
        message: "Sorteio criado com sucesso",
      });
    });
  }
});

router.route("/").get((req, res) => {
  Raffle.find()
    .then((raffles) => res.status(200).json({ success: true, raffles }))
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

router.route("/update/:id").put(async (req, res) => {
  let newData = req.body;
  let { name, participationEndDateTime, isInactive } = newData;
  let existsOne = await Raffle.findOne({ _id: req.params.id });

  if (!existsOne)
    return res
      .status(404)
      .json({ success: false, message: "Este sorteio não existe!" });

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "O sorteio deve ter um nome" });
  } else if (
    !participationEndDateTime ||
    participationEndDateTime === undefined
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Deve indicar uma data de fim" });
  } else if (isInactive === null || undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Deve indicar se está inativo ou não" });
  } else {
    await Raffle.findOneAndUpdate({ _id: req.params.id }, req.body);
    return res
      .status(200)
      .json({ success: true, message: "Sorteio atualizado!" });
  }
});

router.route("/details/:id").get(async (req, res) => {
  try {
    let raffleId = req.params.id;
    if (!raffleId || raffleId === "" || raffleId === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Deve indicar o ID do sorteio" });

    let raffle = await Raffle.findById(raffleId);

    if (!raffle)
      return res
        .status(404)
        .json({ success: false, message: "Sorteio não encontrado!" });
    return res.status(200).json({ success: true, raffle });
  } catch (error) {
    return res.status(400).json({ success: false, data: error.message });
  }
});

router.route("/participate").post(async (req, res) => {
  let participateData = req.body;
  let { coins, userID, raffleID } = participateData;

  let currentRaffle = await Raffle.findOne({ _id: raffleID });
  let currentUser = await User.findOne({ _id: userID });

  if (!currentRaffle)
    return res.status(400).json({
      success: false,
      message: "Sorteio não encontrado",
      alertType: "error",
    });

  if (!currentUser)
    return res.status(400).json({
      success: false,
      message: "Utilizador não encontrado!",
      alertType: "error",
    });

  if (coins === "0" || coins === 0)
    return res.status(400).json({
      success: false,
      message:
        "O número de moedas deve ser maior que zero! Confirme se tens moedas!",
      alertType: "warning",
    });

  if (coins < 0)
    return res.status(400).json({
      success: false,
      message: "O número é negativo! Sou uma piada para ti?",
      alertType: "error",
    });

  if (currentUser.volcoins < coins) {
    return res.status(400).json({
      success: false,
      message: "Você não tem essa quantidade de moedas!",
      alertType: "warning",
    });
  }

  if (currentUser.volcoins === 0)
    return res.status(400).json({
      success: false,
      message: "Você não tem moedas!",
      alertType: "warning",
    });
  else {
    for (let i = 0; i < coins; i++) {
      currentRaffle.users.push(userID);
    }
    let currentCoins = currentUser.volcoins - coins;
    currentUser.volcoins = currentCoins;
    currentUser.save();
    currentRaffle.save();
    return res.status(200).json({
      success: true,
      message: "Participação Registada!",
      alertType: "success",
    });
  }
});

router.route("/getWinners/:id").get(async (req, res) => {
  let raffleId = req.params.id;

  let raffle = await Raffle.findById(raffleId);

  if (!raffle)
    return res
      .status(404)
      .json({ success: false, message: "Sorteio não encontrado!" });
  let winners = [];
  raffle.winners.forEach((el) => winners.push(el));

  if (!winners || winners.length === 0)
    return res.status(404).json({ success: false, message: "Sem ganhadores!" });
  return res.status(200).json({ success: true, winners });
});

function randomPosition(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.route("/drawWinners/:id").get(async (req, res) => {
  try {
    let raffle = await Raffle.findById(req.params.id);

    if (!raffle)
      return res
        .status(404)
        .json({ success: false, message: "Sorteio não encontrado!" });

    const numberOfPlacements =
      raffle.awardTable[raffle.awardTable.length - 1].max;
    let prize = "";
    let usersCopy = raffle.users;
    let winner = "";
    for (var i = 0; i < numberOfPlacements; i++) {
      prize = "";

      raffle.awardTable.some((award, index) => {
        if (i + 1 <= award.max) {
          prize = award.reward;
          return true;
        }
      });

      winner = usersCopy[randomPosition(0, usersCopy.length - 1)];
      raffle.winners.push({
        userID: winner,
        placement: i + 1,
        reward: prize,
      })

      let user = await User.findById(winner);

      if (user) {
        let data = {
          auth: config.authKey,
          action: "raffleWinner",
          recipient: user.email,
          params: {
            firstName: user.firstName,
            raffleName: raffle.name,
            placement: i + 1,
            prize: prize,
          },
        };
        axios.post(config.hostAddress + "/api/email/notify", data);
      }

      usersCopy = usersCopy.filter(x => x !== winner);
    }
    raffle.wasDrawn = true;
    raffle.save();
    return res.status(200).json({ success: true, winners: raffle.winners });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
