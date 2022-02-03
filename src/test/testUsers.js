// Import the dependencies for testing
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../app')
var User = require('../model/user')
// Configure chai
chai.use(chaiHttp);
chai.should();


describe("Users", () => {
  describe("POST /login", () => {
    it("Should send an error when invalid credentials", (done) => {
      const credentials = {
        username: "tes",
        password: "tes"
      }
      chai.request(server)
      .post("/user/login")
      .send(credentials)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      })
    });
    it("Should log user in with correct credentials", (done) => {
      const credentials = {
        username: "test",
        password: "test"
      }
      chai.request(server)
      .post("/user/login")
      .send(credentials)
      .end((err, res) => {
        res.should.have.status(200);
        done()
      })
    });

  });
});
