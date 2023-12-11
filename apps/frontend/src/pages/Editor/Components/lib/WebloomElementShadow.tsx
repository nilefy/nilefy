import store from '@/store';
export const WebloomElementShadow = () => {
  const shadow = store((state) => state.shadowElement);
  if (!shadow) return null;
  return <ElementShadow {...shadow} />;
};

function ElementShadow({
  width,
  height,
  x,
  y,
}: {
  width: number;
  height: number;
  x: number;
  y: number;
}) {
  return (
    <div
      key={'shadown'}
      className="absolute z-50 bg-gray-500 opacity-50"
      style={{
        width: width,
        height: height,
        transform: `translate(${x}px, ${y}px)`,
      }}
    ></div>
  );
}
