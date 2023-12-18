import { Dialog, Transition, TransitionRootProps } from "@headlessui/react";
import React, { Fragment, PropsWithChildren } from "react";
import BaseCard from "./BaseCard";

type BaseModalProps = PropsWithChildren & {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  beforeEnter?: () => void;
  afterEnter?: () => void;
  beforeLeave?: () => void;
  afterLeave?: () => void;
};

export default function BaseModal({
  isOpen,
  onClose,
  className,
  children,
  ...props
}: BaseModalProps) {
  return (
    <Transition show={isOpen} as={Fragment} unmount={true} {...props}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel as={Fragment}>
                <BaseCard className={className}>{children}</BaseCard>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
