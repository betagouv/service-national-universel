import { RequestMethod, Type } from "@nestjs/common";
import { METHOD_METADATA, MODULE_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { AdminModule } from "@admin/Admin.module";

// Inventaire des routes réellement montées par AdminModule, lu sur les métadonnées Nest : un test
// e2e ne verrait pas une route dont le contrôleur n'est enregistré que dans le vrai module.
const listerRoutes = (): string[] => {
    const controllers: Type[] = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AdminModule) ?? [];
    return controllers.flatMap((controller) => {
        const prefixe = String(Reflect.getMetadata(PATH_METADATA, controller) ?? "");
        return Object.getOwnPropertyNames(controller.prototype)
            .filter((nom) => nom !== "constructor")
            .map((nom) => controller.prototype[nom])
            .filter((handler) => typeof handler === "function" && Reflect.hasMetadata(PATH_METADATA, handler))
            .map((handler) => {
                const methode = RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)];
                const chemin = [prefixe, String(Reflect.getMetadata(PATH_METADATA, handler))]
                    .join("/")
                    .replace(/\/+/g, "/")
                    .replace(/^\/|\/$/g, "");
                return `${methode} ${chemin}`;
            });
    });
};

describe("Routes d'administration CLE retirées de l'apiv2 (GOO-55)", () => {
    const routes = listerRoutes();

    it("l'inventaire lit bien les routes du module", () => {
        expect(routes).toContain("GET history/reference");
    });

    it.each([
        // PC1 : modifier-ou-creer forgeait un compte ACTIVE de n'importe quel rôle
        "POST classe/:id/referent/modifier-ou-creer",
        // PL11 : vérification de classe, décommissionnée avec CLE
        "POST classe/:id/verify",
        // PM38 : inscription manuelle d'élèves, inscriptions fermées
        "POST classe/:id/inscription-manuelle",
        // PH23 : annuaire des référents de classe
        "GET referent",
    ])("%s n'est plus exposée", (route) => {
        expect(routes).not.toContain(route);
    });

    it("aucune route ne reste sous classe/ ni referent", () => {
        expect(routes.filter((route) => /^\w+ (classe|referent)(\/|$)/.test(route))).toEqual([]);
    });
});
