import { twMerge } from 'tailwind-merge';

export const cn = (...clx: (string | undefined)[]) => {
    return twMerge(...clx.filter(Boolean));
};
