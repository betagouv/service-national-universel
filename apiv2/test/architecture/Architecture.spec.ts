import { RelativePath } from "arch-unit-ts/dist/arch-unit/core/domain/RelativePath";
import { TypeScriptProject } from "arch-unit-ts/dist/arch-unit/core/domain/TypeScriptProject";
import { Architectures } from "arch-unit-ts/dist/arch-unit/library/Architectures";
import { classes, noClasses } from "arch-unit-ts/dist/main";
import { MatchingPattern } from "./MatchingPattern";

describe("Architecture test", () => {
    const srcProject = new TypeScriptProject(RelativePath.of("src"), "**/*.spec.ts"); // Ignore tests files

    describe("Application", () => {
        it("Should not depend on infrastructure", () => {
            noClasses()
                .that()
                .resideInAPackage(MatchingPattern.CORE)
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(MatchingPattern.INFRA)
                .because("core should not depend on infrastructure")
                .check(srcProject.allClasses());
        });
        it("Should only have few dependencies", () => {
            classes()
                .that()
                .resideInAPackage(MatchingPattern.CORE)
                .should()
                .onlyDependOnClassesThat()
                .resideInAnyPackage(
                    MatchingPattern.SNU_LIB,
                    MatchingPattern.CORE,
                    MatchingPattern.NESTJS_COMMON,
                    MatchingPattern.NESTJS_TESTING,
                    MatchingPattern.NESTJS_CONFIG,
                )
                .because("Core should not depend on any other dependencies")
                .check(srcProject.allClasses());
        });

        it("Repository should depend on gateway", () => {
            classes()
                .that()
                .resideInAPackage(MatchingPattern.INFRA)
                .and()
                .haveSimpleNameEndingWith(MatchingPattern.REPOSITORY_SUFFIX)
                .should()
                .dependOnClassesThat()
                .haveSimpleNameEndingWith(MatchingPattern.GATEWAY_SUFFIX)
                .allowEmptyShould(false)
                .because("Repository should implement gateway")
                .check(srcProject.allClasses());
        });

        it("Core should not have some classes named", () => {
            noClasses()
                .that()
                .resideInAPackage(MatchingPattern.CORE)
                .should()
                .haveSimpleNameEndingWith(MatchingPattern.REPOSITORY_SUFFIX)
                .orShould()
                .haveSimpleNameEndingWith(MatchingPattern.CONTROLLER_SUFFIX)
                .orShould()
                .haveSimpleNameEndingWith(MatchingPattern.CONSUMER_SUFFIX)
                .orShould()
                .haveSimpleNameEndingWith(MatchingPattern.PROVIDER_SUFFIX)
                .orShould()
                .haveSimpleNameEndingWith(MatchingPattern.FACTORY_SUFFIX)
                .orShould()
                .haveSimpleNameEndingWith(MatchingPattern.PRODUCER_SUFFIX)
                .because("Core should not implement repo, ...")
                .check(srcProject.allClasses());
        });
    });

    describe("Admin", () => {
        it("Should implement an hexagonal architecture", () => {
            Architectures.layeredArchitecture()
                .consideringOnlyDependenciesInAnyPackage(MatchingPattern.ADMIN_CORE, MatchingPattern.ADMIN_INFRA)
                .layer("useCase", MatchingPattern.ADMIN_USECASE)
                .layer("repository", MatchingPattern.ADMIN_REPOSITORY)
                .layer("infra", MatchingPattern.ADMIN_INFRA)
                .layer("core", MatchingPattern.ADMIN_CORE)
                .layer("service", MatchingPattern.ADMIN_SERVICE)
                .whereLayer("useCase")
                .mayOnlyBeAccessedByLayers("infra", "useCase", "service")
                .whereLayer("repository")
                .mayOnlyBeAccessedByLayers("infra")
                .whereLayer("infra")
                .mayNotBeAccessedByAnyLayer()
                .because("Each bounded context should implement an hexagonal architecture")
                .check(srcProject.allClasses());
        });
        it("Should depend on specific dependencies", () => {
            classes()
                .that()
                .resideInAPackage(MatchingPattern.ADMIN_CORE)
                .should()
                .onlyDependOnClassesThat()
                .resideInAnyPackage(
                    MatchingPattern.SNU_LIB,
                    MatchingPattern.NOTIFICATION_CORE,
                    MatchingPattern.TASK_CORE,
                    MatchingPattern.SHARED_CORE,
                    MatchingPattern.ADMIN_CORE,
                    MatchingPattern.NESTJS_COMMON,
                    MatchingPattern.NESTJS_TESTING,
                    MatchingPattern.NESTJS_CONFIG,
                )
                .because("Core should not depend on any other dependencies")
                .check(srcProject.allClasses());
        });
    });

    describe("Shared", () => {
        it("Should depend on specific dependencies", () => {
            classes()
                .that()
                .resideInAPackage(MatchingPattern.SHARED_CORE)
                .should()
                .onlyDependOnClassesThat()
                .resideInAnyPackage(MatchingPattern.SHARED_CORE, MatchingPattern.NESTJS_COMMON, MatchingPattern.SNU_LIB)
                .because("Shared should not depend on any other dependencies")
                .check(srcProject.allClasses());
        });
    });

    describe("BullMQ", () => {
        it("Consumer should be in jobModule", () => {
            classes()
                .that()
                .haveSimpleNameEndingWith(MatchingPattern.CONSUMER_SUFFIX)
                .should()
                .onlyHaveDependentClassesThat()
                .haveSimpleNameEndingWith(MatchingPattern.JOB_MODULE_SUFFIX)
                .andShould()
                .dependOnClassesThat()
                .resideInAPackage(MatchingPattern.NESTJS_BULLMQ)
                .allowEmptyShould(false)
                .because("Consumer should be in jobModule")
                .check(srcProject.allClasses());
        });
    });
});
