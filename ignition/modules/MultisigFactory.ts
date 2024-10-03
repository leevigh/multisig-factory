import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// MultisigFactoryModule#MultisigFactory - 0x61e8977Df46761e3519B3e596d1c20cA41bF0D0D
const MultisigFactoryModule = buildModule("MultisigFactoryModule", (m) => {
//   const quorum = m.getParameter("_quorum", 3);
//   const validSigners = m.getParameter("_validSigners", ["0x0f490D84DDd5E0A2881eF8F319664C7f8Fd6335C", ]);

  const multisigFactory = m.contract("MultisigFactory");

  return { multisigFactory };
});

export default MultisigFactoryModule;

// Successfully verified contract MultisigFactory on the block explorer.
// https://sepolia-blockscout.lisk.com/address/0x61e8977Df46761e3519B3e596d1c20cA41bF0D0D#code
