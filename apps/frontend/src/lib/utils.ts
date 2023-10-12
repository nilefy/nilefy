export const getDOMInfo = (el: HTMLElement) => {
    const { top, left, width, height } = el.getBoundingClientRect();
    return {
        x: left,
        y: top,
        width,
        height
    };
};

export type WebloomNodeDimensions = ReturnType<typeof getDOMInfo>;
