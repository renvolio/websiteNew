async function loadMnistData() {
    const mnist = await tf.data.mnist();

    const trainData = mnist.trainData;
    const testData = mnist.testData;

    const preprocess = (dataset) => {
        return dataset.map(data => {
            const image = tf.tensor1d(data.xs).reshape([28, 28, 1]);
            const label = tf.oneHot(tf.tensor1d(data.ys).toInt(), 10);
            return { image, label };
        }).batch(128).prefetch(8);
    };

    const preparedTrainData = preprocess(trainData);
    const preparedTestData = preprocess(testData);

    return { preparedTrainData, preparedTestData };
}
