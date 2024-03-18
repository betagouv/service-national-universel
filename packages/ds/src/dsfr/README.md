# DSFR

## Useful links

* [Guide](https://react-dsfr.codegouv.studio/)
* [Docs Components & Colors](https://components.react-dsfr.codegouv.studio/)
* [Github React DSFR](https://github.com/codegouvfr/react-dsfr)
* [Icons list](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/icone)

After adding new icons to the code, you'll need to kill & re-run `npm run dev` because of the _predev_ script `only-include-used-icons`


## Importing react-dsfr components

Components from react-dsfr package should only be imported inside the ds package.
Therefore, if for example, you plan on using the `Input` component from `react dsfr` you should go to `packages/ds/src/dsfr/index.ts` and just import / export it like this: 

```

import { Input } from "@codegouvfr/react-dsfr/Input";

export {
  Input,
  Section,
  Field,
  List,
  ...
};

```

That's the best way to keep control over those components, if someday I we want to rework the `Input`, we don't have to modify the imports.
