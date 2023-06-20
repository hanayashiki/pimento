"use client";

import { useMemo, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { cx } from "classix";
import { pipe } from "remeda";

import {
  createPaymentCard,
  deletePaymentCard,
  updatePaymentCard,
} from "../_actions";
import { Dialog } from "@/components/Dialog";
import { useAction } from "@/lib/action/client";
import { useMe } from "@/lib/client/MeProvider";
import { useField } from "@/lib/client/useField";
import { useSensitiveQuery } from "@/lib/client/useSensitive";
import {
  formatExpirationDate,
  formatPan,
  normalizePan,
  paymentCardMetaMap,
} from "@/lib/data/paymentCard";
import { PaymentCardBrand, PaymentCardDO } from "@/lib/models";
import { getPersistHashedPassword, toSensitive } from "@/lib/Sensitive";

export const PaymentCardDialog: React.FC<{
  password?: PaymentCardDO;
  open: boolean;
  onClose: () => void;
}> = ({ password, open, onClose }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createAction = useAction(createPaymentCard);
  const updateAction = useAction(updatePaymentCard);
  const deleteAction = useAction(deletePaymentCard);

  const clearErrors = () => {
    createAction.clearErrors();
    updateAction.clearErrors();
  };

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["listPaymentCard"],
    });
  };

  const { me } = useMe();

  const queryClient = useQueryClient();

  const urlField = useField();
  const nameField = useField();
  const panField = useField({
    onChange() {
      const nameMeta = Object.entries(paymentCardMetaMap).find(([_, meta]) =>
        meta.regex.test(normalizePan(panField.value)),
      );

      if (nameMeta) {
        const [name, meta] = nameMeta;

        setBrand(name as PaymentCardBrand);

        const [nextSelection, nextValue] = formatPan(
          panField.ref.current!.selectionStart!,
          panField.value,
          meta.rules,
        );
        panField.setValue(nextValue);
        panField.ref.current!.selectionStart = nextSelection;
        panField.ref.current!.selectionEnd = nextSelection;
      } else {
        setBrand("Other");
      }

      clearErrors();
    },
  });
  const expirationDateField = useField({
    onChange() {
      const [nextSelection, nextValue] = formatExpirationDate(
        expirationDateField.ref.current!.selectionStart!,
        expirationDateField.value,
      );
      expirationDateField.setValue(nextValue);
      expirationDateField.ref.current!.selectionStart = nextSelection;
      expirationDateField.ref.current!.selectionEnd = nextSelection;
      clearErrors();
    },
  });
  const cardholderField = useField();
  const cvvField = useField();

  useSensitiveQuery(
    password?.pan!,
    useMemo(
      () => ({
        enabled: !!password,
        onSuccess(v) {
          panField.setValue(v);
        },
      }),
      [password],
    ),
  );

  useSensitiveQuery(
    password?.expirationDate!,
    useMemo(
      () => ({
        enabled: !!password,
        onSuccess(v) {
          expirationDateField.setValue(v);
        },
      }),
      [password],
    ),
  );

  useSensitiveQuery(
    password?.cardholder!,
    useMemo(
      () => ({
        enabled: !!password,
        onSuccess(v) {
          cardholderField.setValue(v);
        },
      }),
      [password],
    ),
  );

  useSensitiveQuery(
    password?.cvv!,
    useMemo(
      () => ({
        enabled: !!password,
        onSuccess(v) {
          cvvField.setValue(v);
        },
      }),
      [password],
    ),
  );

  const [brand, setBrand] = useState<PaymentCardBrand>("Other");

  const renderBrand = () => {
    if (brand === "Other") return null;

    const nameMeta = paymentCardMetaMap[brand];

    if (nameMeta) {
      return (
        <img
          src={nameMeta.darkImage.src}
          height={57 / 2}
          width={72 / 2}
          className="absolute right-4 top-[9px]"
        />
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={password ? "Edit Payment Card" : "Create Payment Card"}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.stopPropagation();
          e.preventDefault();

          if (password) {
            await updateAction.execute({
              id: password.id,
              url: urlField.value,
              name: nameField.value,
              pan: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                panField.value,
              ),
              brand,
              cvv: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                cvvField.value,
              ),
              expirationDate: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                expirationDateField.value,
              ),
              cardholder: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                cardholderField.value,
              ),
              lastDigits: pipe(normalizePan(panField.value), (s) =>
                s.slice(s.length - 4, s.length),
              ),
              type: "PAYMENT_CARD",
            });
          } else {
            await createAction.execute({
              url: urlField.value,
              name: nameField.value,
              pan: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                panField.value,
              ),
              brand,
              cvv: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                cvvField.value,
              ),
              expirationDate: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                expirationDateField.value,
              ),
              cardholder: await toSensitive(
                getPersistHashedPassword()!,
                me.nonce,
                cardholderField.value,
              ),
              lastDigits: pipe(normalizePan(panField.value), (s) =>
                s.slice(s.length - 4, s.length),
              ),
              type: "PAYMENT_CARD",
            });
          }

          onClose();
          refresh();
        }}
      >
        <input
          className={cx("input input-bordered")}
          placeholder="URL"
          type="url"
          name="url"
          ref={urlField.ref}
          defaultValue={password?.url}
          onChange={clearErrors}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="Name"
          type="text"
          name="name"
          ref={nameField.ref}
          defaultValue={password?.name}
          onChange={clearErrors}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="Cardholder"
          type="text"
          name="cardholder"
          ref={cardholderField.ref}
        />

        <div className="relative flex flex-col">
          <input
            className={cx("input input-bordered")}
            placeholder="Card Number"
            type="text"
            name="name"
            ref={panField.ref}
            onChange={panField.onChange}
          />

          {renderBrand()}
        </div>

        <input
          className={cx("input input-bordered")}
          placeholder="Expiration Date"
          type="text"
          name="expirationDate"
          ref={expirationDateField.ref}
          defaultValue="__/__"
          onChange={expirationDateField.onChange}
        />

        <input
          className={cx("input input-bordered")}
          placeholder="CVV"
          type="text"
          name="cvv"
          ref={cvvField.ref}
        />

        <div className="flex gap-x-4">
          <button
            className={cx(
              "btn btn-primary",
              (createAction.loading || updateAction.loading) && "loading",
            )}
            type="submit"
          >
            {password ? "EDIT" : "CREATE"}
          </button>

          {password &&
            (confirmDelete ? (
              <button
                className={cx(
                  "btn btn-error",
                  deleteAction.loading && "loading",
                )}
                type="button"
                onClick={() =>
                  deleteAction.execute(password.id).then(refresh).then(onClose)
                }
              >
                CONFIRM DELETE
              </button>
            ) : (
              <button
                className={"btn btn-error"}
                type="button"
                onClick={() => setConfirmDelete(true)}
              >
                DELETE
              </button>
            ))}

          <button className="btn" onClick={onClose} type="button">
            CANCEL
          </button>
        </div>
      </form>
    </Dialog>
  );
};
