require("dotenv").config({ path: "../.env" });
const chai = require("chai");
const mongoose = require("mongoose");
const chaiHttp = require("chai-http");
const config = require("../config");
const dataStats = require("./dataStatistics.json");
const uri = config.atlasUri;

describe("Estatísticas", () => {
  it("Deve mostrar os tipos de projetos (Externo/Interno) - /projects/types", (done) => {
    chai
      .request("http://localhost:5000")
      .get("/api/statistics/projects/types")
      .end((err, res) => {
        chai.assert.isNull(err);
        res.body.should.be.a("object");
        res.should.have.status(200);
        res.body.should.have.property("success").equal(true);
        done();
      });
  });

  it("Deve mostrar a faixa dos utilizadores - /users/averageAge", (done) => {
    chai
      .request("http://localhost:5000")
      .get("/api/statistics/users/averageAge")
      .end((err, res) => {
        chai.assert.isNull(err);
        res.body.should.be.a("object");
        res.should.have.status(200);
        res.body.should.have.property("success").equal(true);
        done();
      });
  });
});
