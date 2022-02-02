function    rotate2d(vec, angle) {
    return {x: vec.x * Math.cos(angle) - vec.y * Math.sin(angle), y: vec.x * Math.sin(angle) + vec.y * Math.cos(angle)}
}

function multiply(vec, coefficient) {
    return {x: vec.x * coefficient, y: vec.y * coefficient};
}

function sum(vec1, vec2) {
    return {x: vec1.x + vec2.x, y: vec1.y + vec2.y};
}

function distance2Vec(vec1, vec2) {
    return Math.sqrt((vec1.x - vec2.x) * (vec1.x - vec2.x) + (vec1.y - vec2.y) * (vec1.y - vec2.y));
}

function lengthVec(vec1) {
    return Math.sqrt((vec1.x) * (vec1.x) + (vec1.y) * (vec1.y));
}

function angle2Vec(vec1, vec2) {
    return Math.acos((vec1.x * vec2.x + vec1.y * vec2.y) / (lengthVec(vec1) * lengthVec(vec2)));
}