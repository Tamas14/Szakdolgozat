let timer;
let mutants;
let i;

let start_money = 10000;
let processing = false;
let best_mutation;

genetic = {
    isProcessing: false,
    start_money: 10000,
    iterations: 100
}

function startGeneticAlgorithm() {
    init();
    process();
}

function init() {
    best_mutation = {
        fitness: 0,
        money: 0,
        weights: [],
    };
    i = 0;
    mutants = getInitialPopulation();
    genetic.isProcessing = true;
    disableOutput = true;
}

function calcFitness(start_money, end_money) {
    return end_money / start_money;
}

function process() {
    mutants = newGeneration(mutants);
}

async function newGeneration(population) {
    if (i > genetic.iterations) {
        console.info("Cannot get better population in " + genetic.iterations + " interations.");
        console.info(best_mutation);
        genetic.isProcessing = false;
        disableOutput = false;
        return;
    }

    let matePool = [];

    let fitness = [];
    let result = [];
    for (let mutant of population) {
        result.push(await loadStock(mutant));
        fitness.push(calcFitness(start_money, result[result.length - 1].money));
    }

    let best = getBest(fitness);
    let maxFitness = Math.max.apply(null, fitness);

    population
        .forEach((e, i) => {
            let fit = map(fitness[i], 0, maxFitness, 0, 0.1);
            let pool = Array(Math.floor(fit * 100)).fill(e);
            matePool = [...matePool, ...pool];
        })

    let mutants = population.map((a) => {
        let i = Math.floor(Math.random() * matePool.length);
        let j = Math.floor(Math.random() * matePool.length);

        let child = crossover(matePool[i], matePool[j]);
        let mutant = mutate(child);

        return mutant;
    })

    if (best_mutation.fitness < maxFitness) {
        best_mutation.fitness = maxFitness;
        best_mutation.money = result[best].money;
        best_mutation.weights = population[fitness.indexOf(maxFitness)];
        i = 0;
        console.log(best_mutation);
    }

    i++;
    mutants = newGeneration(mutants);
}

function mutate(child) {
    return child
        .map(e =>
            Math.random() < 0.1
                ?
                getRandomNumber()
                :
                e
        )
}

function crossover(a, b) {
    let len = a.length;
    let midpoint = Math.floor(Math.random() * len);

    let child = a.slice(0, midpoint).concat(b.slice(midpoint, len));

    return child;
}

function map(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function getBest(fitness) {
    return fitness.indexOf(Math.max(...fitness));
}

//10 elemű
function getInitialPopulation() {
    return [...new Array(10)]
        .map(d =>
            Array(11)
                .fill("0")
                .map(d => getRandomNumber())
        );
}

function getRandomNumber() {
    return Math.random() * 10;
}
