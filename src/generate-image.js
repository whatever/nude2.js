import * as ort from 'onnxruntime-web';

const net = "./nude2-dcgan-met-random-crop-198x198.onnx";

async function generateImageFromOnnxWeb(vec) {
  const session = await ort.InferenceSession.create(
    net,
    { executionProviders: ['webgl'] }
  );

  const b = 1;
  const n = 100;

  const t = new ort.Tensor("float32", vec, [b, n, 1, 1]);

  let r = await session.run({ "vector": t });

  const u = new ort.Tensor("float32", vec, [b, n, 1, 1]);
  Object.assign(u.data, r["output"].data);

  return r["output"];
  return r["output"].toDataURL();
}

onmessage = async (e) => {
  let vec = e.data.vec;
  postMessage(await generateImageFromOnnxWeb(vec));
}
