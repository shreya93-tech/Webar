import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.156/build/three.module.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.156/examples/jsm/loaders/GLTFLoader.js'
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.156/examples/jsm/webxr/ARButton.js'

let camera, scene, renderer
let controller
let reticle
let model

let loader = new GLTFLoader()

let currentModel = "heart"

const descriptions = {

heart: "The human heart pumps blood through the body and supplies oxygen to tissues.",

atom: "Atoms are the smallest building blocks of matter consisting of electrons protons and neutrons.",

triangle: "The Pythagorean theorem states that a² + b² = c² in a right triangle.",

magnet: "Magnets create magnetic fields and attract metals like iron."

}

window.changeModel = function(type){

currentModel = type

document.getElementById("title").innerText = type.toUpperCase()

document.getElementById("description").innerText = descriptions[type]

speak(descriptions[type])

}

function speak(text){

let msg = new SpeechSynthesisUtterance(text)

speechSynthesis.speak(msg)

}

document.getElementById("startAR").addEventListener("click", initAR)

function initAR(){

scene = new THREE.Scene()

camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20)

renderer = new THREE.WebGLRenderer({alpha:true, antialias:true})

renderer.setSize(window.innerWidth, window.innerHeight)

renderer.xr.enabled = true

document.body.appendChild(renderer.domElement)

document.body.appendChild(ARButton.createButton(renderer,{requiredFeatures:['hit-test']}))

const light = new THREE.HemisphereLight(0xffffff,0xbbbbff,1)

scene.add(light)

controller = renderer.xr.getController(0)

controller.addEventListener("select", placeModel)

scene.add(controller)

reticle = new THREE.Mesh(

new THREE.RingGeometry(0.15,0.2,32).rotateX(-Math.PI/2),

new THREE.MeshBasicMaterial()

)

reticle.matrixAutoUpdate = false

reticle.visible = false

scene.add(reticle)

renderer.setAnimationLoop(render)

}

function placeModel(){

if(!reticle.visible) return

loader.load(`${currentModel}.glb`,function(gltf){

model = gltf.scene

model.position.setFromMatrixPosition(reticle.matrix)

model.scale.set(0.4,0.4,0.4)

scene.add(model)

})

}

let hitTestSource = null
let localSpace = null

function render(timestamp,frame){

if(frame){

const referenceSpace = renderer.xr.getReferenceSpace()

const session = renderer.xr.getSession()

if(hitTestSource === null){

session.requestReferenceSpace("viewer").then(space=>{

session.requestHitTestSource({space:space}).then(source=>{

hitTestSource = source

})

})

session.requestReferenceSpace("local").then(space=>{

localSpace = space

})

}

if(hitTestSource){

const hitTestResults = frame.getHitTestResults(hitTestSource)

if(hitTestResults.length){

const hit = hitTestResults[0]

reticle.visible = true

reticle.matrix.fromArray(hit.getPose(localSpace).transform.matrix)

}else{

reticle.visible = false

}

}

}

renderer.render(scene,camera)

}