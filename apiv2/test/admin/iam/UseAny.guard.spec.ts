import { Controller, Get, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CanActivate, ExecutionContext } from "@nestjs/common/interfaces";
import { Injectable } from "@nestjs/common";
import * as request from "supertest";
import { UseAnyGuard } from "@admin/infra/iam/guard/Any.guard";

@Injectable()
class MockTrueGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        return true;
    }
}

@Injectable()
class MockFalseGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        return false;
    }
}

@Injectable()
class MockErrorGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        throw new Error("Guard error");
    }
}

@Controller("test")
class TestController {
    @Get("no-guard")
    noGuard() {
        return "success";
    }

    @Get("single-true")
    @UseAnyGuard(MockTrueGuard)
    singleTrueGuard() {
        return "success";
    }

    @Get("single-false")
    @UseAnyGuard(MockFalseGuard)
    singleFalseGuard() {
        return "success";
    }

    @Get("multiple-one-true")
    @UseAnyGuard(MockFalseGuard, MockTrueGuard)
    multipleOneTrue() {
        return "success";
    }

    @Get("multiple-all-false")
    @UseAnyGuard(MockFalseGuard, MockFalseGuard)
    multipleAllFalse() {
        return "success";
    }

    @Get("with-error")
    @UseAnyGuard(MockErrorGuard, MockTrueGuard)
    withError() {
        return "success";
    }
}

describe("UseAnyGuard", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
            providers: [MockTrueGuard, MockFalseGuard, MockErrorGuard],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it("should allow access when no guard is present", () => {
        return request(app.getHttpServer()).get("/test/no-guard").expect(200).expect("success");
    });

    it("should allow access when single true guard is present", () => {
        return request(app.getHttpServer()).get("/test/single-true").expect(200).expect("success");
    });

    it("should deny access when single false guard is present", () => {
        return request(app.getHttpServer()).get("/test/single-false").expect(403);
    });

    it("should allow access when at least one guard returns true", () => {
        return request(app.getHttpServer()).get("/test/multiple-one-true").expect(200).expect("success");
    });

    it("should deny access when all guards return false", () => {
        return request(app.getHttpServer()).get("/test/multiple-all-false").expect(403);
    });

    it("should continue to next guard when error occurs and allow if subsequent guard returns true", () => {
        return request(app.getHttpServer()).get("/test/with-error").expect(200).expect("success");
    });
});
