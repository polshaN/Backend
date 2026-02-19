import supertest from "supertest";
import {server} from "../api/server";


const request = supertest(server);

export default request;
