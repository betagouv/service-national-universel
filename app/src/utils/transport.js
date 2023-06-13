const departureOnMonday = [
  {
    _id: {
      $oid: "64760410ce77f613cb3b2bf5",
    },
    busId: "ARA001071",
  },
  {
    _id: {
      $oid: "6476041cce77f613cb3b37b1",
    },
    busId: "CVL028018",
  },
  {
    _id: {
      $oid: "6476041dce77f613cb3b38fe",
    },
    busId: "CVL045771",
  },
  {
    _id: {
      $oid: "6476042fce77f613cb3b4a2b",
    },
    busId: "IDF095006",
  },
  {
    _id: {
      $oid: "6476042fce77f613cb3b4a8d",
    },
    busId: "IDF095422",
  },
  {
    _id: {
      $oid: "64760430ce77f613cb3b4bad",
    },
    busId: "NOA019003",
  },
  {
    _id: {
      $oid: "64760432ce77f613cb3b4dec",
    },
    busId: "NOA040046",
  },
  {
    _id: {
      $oid: "6476043ece77f613cb3b5637",
    },
    busId: "OCC034520",
  },
  {
    _id: {
      $oid: "6476043ece77f613cb3b561d",
    },
    busId: "OCC034510",
  },
  {
    _id: {
      $oid: "6476041dce77f613cb3b38c4",
    },
    busId: "CVL041852",
  },
  {
    _id: {
      $oid: "6476042bce77f613cb3b46ad",
    },
    busId: "IDF078341",
  },
  {
    _id: {
      $oid: "6476043ece77f613cb3b5709",
    },
    busId: "OCC081015",
  },
  {
    _id: {
      $oid: "64760412ce77f613cb3b2d5b",
    },
    busId: "ARA026071",
  },
  {
    _id: {
      $oid: "64760430ce77f613cb3b4bcd",
    },
    busId: "NOA019421",
  },
  {
    _id: {
      $oid: "6476041cce77f613cb3b3864",
    },
    busId: "CVL037079",
  },
];

export const busLignesDepartLundi = departureOnMonday.map((e) => e._id.$oid);
