import type { StaticImageData } from "next/image";

import type { PaymentCardBrand } from "../models";
import amexDark from "@/assets/amex-dark.png";
import amexLight from "@/assets/amex-light.png";
import dinersClubDark from "@/assets/diners_club-dark.png";
import dinersClubLight from "@/assets/diners_club-light.png";
import discoverDark from "@/assets/discover-dark.png";
import discoverLight from "@/assets/discover-light.png";
import jcbDark from "@/assets/jcb-dark.png";
import jcbLight from "@/assets/jcb-light.png";
import maestroDark from "@/assets/maestro-dark.png";
import maestroLight from "@/assets/maestro-light.png";
import mastercardDark from "@/assets/mastercard-dark.png";
import mastercardLight from "@/assets/mastercard-light.png";
import unionPayDark from "@/assets/union_pay-dark.png";
import unionPayLight from "@/assets/union_pay-light.png";
import visaDark from "@/assets/visa-dark.png";
import visaLight from "@/assets/visa-light.png";

export interface PaymentCardRuleEntry {
  cardLength: number;
  blocks: number[];
}

export interface PaymentCardMeta {
  lightImage: StaticImageData;
  darkImage: StaticImageData;
  rules: PaymentCardRuleEntry[];
  regex: RegExp;
}

export const paymentCardMetaMap: Record<
  Exclude<PaymentCardBrand, "Other">,
  PaymentCardMeta
> = {
  Visa: {
    lightImage: visaLight,
    darkImage: visaDark,
    rules: [{ cardLength: 16, blocks: [4, 4, 4, 4] }],
    regex: /^4/,
  },
  Mastercard: {
    lightImage: mastercardLight,
    darkImage: mastercardDark,
    rules: [{ cardLength: 16, blocks: [4, 4, 4, 4] }],
    regex:
      /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/,
  },
  /**
   * @see: https://docs.trellix.com/ja/bundle/data-loss-prevention-11.10.x-classification-definitions-reference-guide/page/GUID-9EE5ADC1-2730-439F-860F-21625F39EF0A.html
   */
  Maestro: {
    lightImage: maestroLight,
    darkImage: maestroDark,
    rules: [
      { cardLength: 16, blocks: [4, 4, 4, 4] },
      { cardLength: 13, blocks: [4, 4, 5] },
      { cardLength: 15, blocks: [4, 6, 5] },
      { cardLength: 19, blocks: [4, 4, 4, 4, 3] },
    ],
    regex: /^(50|56|57|58|6013|62|63|67|237)/,
  },
  Discover: {
    lightImage: discoverLight,
    darkImage: discoverDark,
    rules: [{ cardLength: 16, blocks: [4, 4, 4, 4] }],
    regex:
      /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
  },
  "Diners Club": {
    lightImage: dinersClubLight,
    darkImage: dinersClubDark,
    rules: [{ cardLength: 14, blocks: [4, 6, 4] }],
    regex: /^36|^30[0-5]/,
  },
  JCB: {
    lightImage: jcbLight,
    darkImage: jcbDark,
    rules: [{ cardLength: 16, blocks: [4, 4, 4, 4] }],
    regex: /^35(2[89]|[3-8][0-9])/,
  },
  /**
   * @see: https://docs.trellix.com/ja/bundle/data-loss-prevention-11.10.x-classification-definitions-reference-guide/page/GUID-B8D29ECE-E70A-401E-B18D-B773F4FF71ED.html
   */
  UnionPay: {
    lightImage: unionPayLight,
    darkImage: unionPayDark,
    rules: [{ cardLength: 16, blocks: [4, 4, 4, 4] }],
    regex: /^62|^60/,
  },
  Amex: {
    lightImage: amexLight,
    darkImage: amexDark,
    rules: [{ cardLength: 15, blocks: [4, 6, 5] }],
    regex: /^3[47]/,
  },
};

export function normalizePan(pan: string) {
  return pan.replace(/\s+/g, "");
}

export function formatPan(
  selection: number,
  pan: string,
  rules: PaymentCardRuleEntry[],
): [number, string] {
  const normalized = normalizePan(pan);
  const normalizedBeforeSelection = normalizePan(pan.slice(0, selection));

  const normalizedSelection = normalizedBeforeSelection.length;
  let nextSelection = normalizedSelection;

  const matchedRule =
    rules.find((r) => r.cardLength === normalized.length) ?? rules[0];

  let formatted = "";

  for (let i = 0, acc = 0; i < matchedRule.blocks.length; i++) {
    const block = normalized.slice(acc, acc + matchedRule.blocks[i]);
    if (block) {
      if (i !== 0) {
        formatted += " ";

        if (acc + matchedRule.blocks[i] <= normalizedSelection) {
          nextSelection += 1;
        }
      }

      formatted += block;
      acc += matchedRule.blocks[i];
    }
  }
  nextSelection += 1;
  return [nextSelection, formatted];
}

export function normalizeExpirationDate(expirationDate: string) {
  return expirationDate.replace(/\s+/g, "");
}

export function formatExpirationDate(
  selection: number,
  expirationDate: string,
): [number, string] {
  const normalized = normalizeExpirationDate(expirationDate);

  if (!normalized.includes("/")) return [0, "__/__"];

  return [
    expirationDate[selection + 1] === "/" ? selection + 1 : selection,
    `${normalized.split("/")[0].slice(0, 2).padEnd(2, "_")}/${normalized
      .split("/")[1]
      .slice(0, 2)
      .padEnd(2, "_")}`,
  ];
}
