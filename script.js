import Spatium from "./engine/Spatium.js"

Spatium.canvas = document.getElementById("animation-canvas")

let modelParts = {
    LegRightMesh: {
        faces: Spatium.mesh.create.cuboid([-4, 0, -2], [0, 12, 2], { fill: "lime", width: 1 }),
        pivot: [-2, 12, 0]
    },
    LegLeftMesh: {
        faces: Spatium.mesh.create.cuboid([0, 0, -2], [4, 12, 2], { fill: "lime", width: 1 }),
        pivot: [2, 12, 0]
    },
    ArmRightMesh: {
        faces: Spatium.mesh.create.cuboid([-8, 12, -2], [-4, 24, 2], { fill: "blue", width: 1 }),
        pivot: [-4, 24, 0]
    },
    ArmLeftMesh: {
        faces: Spatium.mesh.create.cuboid([4, 12, -2], [8, 24, 2], { fill: "blue", width: 1 }),
        pivot: [4, 24, 0]
    },
    TorsoNode: {
        faces: Spatium.mesh.create.cuboid([-4, 12, -2], [4, 24, 2], { fill: "gold", width: 1 }),
        pivot: [0, 12, 0]
    },
    HeadMesh: {
        faces: Spatium.mesh.create.cuboid([-4, 24, -4], [4, 32, 4], { fill: "red", width: 1 }),
        pivot: [0, 24, 0]
    }
}

let mI = 15.5
let round = (value) => Number(value.toFixed(4))

Spatium.tick = () => {
    let torso = nodeData.TorsoNode
    let objects = []
    for (let nodeName of Object.keys(modelParts)) {
        let part = modelParts[nodeName]
        let node = nodeData[nodeName]

        let faces = Spatium.mesh.transform.rotate(part.faces, node.rotation.x * Math.PI / 180, node.rotation.y * Math.PI / 180, node.rotation.z * Math.PI / 180, ...part.pivot)
        faces = Spatium.mesh.transform.translate(faces, node.position.x * mI, node.position.y * mI, node.position.z * mI)
        if (nodeName === "HeadMesh" || nodeName === "ArmLeftMesh" || nodeName === "ArmRightMesh") {
            faces = Spatium.mesh.transform.rotate(faces, torso.rotation.x * Math.PI / 180, torso.rotation.y * Math.PI / 180, torso.rotation.z * Math.PI / 180, 0, 12, 0)

            faces = Spatium.mesh.transform.translate(faces, torso.position.x * mI, torso.position.y * mI, torso.position.z * mI)
        }
        objects.push(faces)
    }
    Spatium.objects = objects
}

Spatium.camZ = -50
Spatium.camY = 16
Spatium.camX = 35
Spatium.camRotYRad = Math.PI / 5

var nodeData = {
    HeadMesh: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    TorsoNode: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    ArmLeftMesh: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    ArmRightMesh: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    LegLeftMesh: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    LegRightMesh: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    }
}

var loadNodeData = () => {
    xRotation.value = nodeData[selectedNode].rotation.x
    yRotation.value = nodeData[selectedNode].rotation.y
    zRotation.value = nodeData[selectedNode].rotation.z
    xRotationNumber.value = xRotation.value
    yRotationNumber.value = yRotation.value
    zRotationNumber.value = zRotation.value
    xPosition.value = nodeData[selectedNode].position.x
    yPosition.value = nodeData[selectedNode].position.y
    zPosition.value = nodeData[selectedNode].position.z
    xPositionNumber.value = xPosition.value
    yPositionNumber.value = yPosition.value
    zPositionNumber.value = zPosition.value
    //ok this is a little unoptimised but idrc
}

var updateSelectedKeyframe = () => {
    if (!selectedKeyframe) return
    selectedKeyframe.data = structuredClone(nodeData)
    updateKeyframeMarkers()
}

let selectedNode = "HeadMesh"

let buttons = document.querySelectorAll(".nodeButton")
let selectedNodeSpan = document.getElementById("selected-node")

loadNodeData()

buttons[0].classList.add("selected")
selectedNodeSpan.textContent = buttons[0].id

for (let button of buttons) {
    button.addEventListener("click", function () {
        buttons.forEach(btn => btn.classList.remove("selected"))
        button.classList.add("selected")
        selectedNode = button.id
        selectedNodeSpan.textContent = selectedNode
        loadNodeData()
    })
}

var showPopup = (success, title, reason, code = null, input = false, inputType = "code") => {
    let popup = document.getElementById(success ? "code-saved-popup" : "code-saving-error-popup")
    let popupContent = popup.querySelector(".popup")
    let oldCode = popupContent.querySelector(".popup-code")
    if (oldCode) oldCode.remove()
    if (code !== null) {
        let codeContainer = document.createElement("div")
        codeContainer.className = "popup-code"
        let codeText = document.createElement("textarea")
        codeText.className = "popup-code-text"
        codeText.value = code
        codeText.readOnly = !input
        codeContainer.appendChild(codeText)
        if (!input) {
            let selectButton = document.createElement("button")
            selectButton.textContent = "Select All"
            selectButton.onclick = () => {
                codeText.focus()
                codeText.select()
            }
            codeContainer.appendChild(selectButton)
        } else {
            let importButton = document.createElement("button")
            importButton.textContent = "Import"
            importButton.onclick = () => {
                if (inputType === "base64") {
                    importBase64(codeText.value)
                } else {
                    importAnimationCode(codeText.value)
                }
                popup.style.display = "none"
            }
            codeContainer.appendChild(importButton)
        }
        popupContent.appendChild(codeContainer)
    }
    if (success) {
        document.getElementById("success-popup-title").textContent = title
        document.getElementById("success-popup-reason").textContent = reason
        popup.style.display = "flex"
    } else {
        document.getElementById("error-popup-title").textContent = title
        document.getElementById("error-popup-reason").textContent = reason
        popup.style.display = "flex"
    }
}

document.querySelectorAll('input[type="range"]').forEach(slider => {
    let no = document.getElementById(slider.id + "Number")
    if (!no) return
    slider.addEventListener('input', function () {
        if (slider.id === "xRotation" || slider.id === "yRotation" || slider.id === "zRotation") {
            let value = Number(slider.value)
            let snapPoints = [0, 90, -90]
            for (let snap of snapPoints) {
                if (Math.abs(value - snap) <= 6) {
                    value = snap
                    slider.value = value
                    no.value = value
                    break
                }
            }
        }
        no.value = slider.value
        if (slider.id === "xRotation")
            nodeData[selectedNode].rotation.x = Number(slider.value)
        if (slider.id === "yRotation")
            nodeData[selectedNode].rotation.y = Number(slider.value)
        if (slider.id === "zRotation")
            nodeData[selectedNode].rotation.z = Number(slider.value)

        if (slider.id === "xPosition" || slider.id === "yPosition" || slider.id === "zPosition") {
            let value = Number(slider.value)
            let snapPoints = [0, 5, -5]
            for (let snap of snapPoints) {
                if (Math.abs(value - snap) <= 0.4) {
                    value = snap
                    slider.value = value
                    no.value = value
                    break
                }
            }
        }
        if (slider.id === "xPosition")
            nodeData[selectedNode].position.x = Number(slider.value)
        if (slider.id === "yPosition")
            nodeData[selectedNode].position.y = Number(slider.value)
        if (slider.id === "zPosition")
            nodeData[selectedNode].position.z = Number(slider.value)
        updateSelectedKeyframe()
    })
    no.addEventListener('input', function () {
        slider.value = no.value
        if (slider.id === "xRotation")
            nodeData[selectedNode].rotation.x = Number(slider.value)
        if (slider.id === "yRotation")
            nodeData[selectedNode].rotation.y = Number(slider.value)
        if (slider.id === "zRotation")
            nodeData[selectedNode].rotation.z = Number(slider.value)
        if (slider.id === "xPosition")
            nodeData[selectedNode].position.x = Number(slider.value)
        if (slider.id === "yPosition")
            nodeData[selectedNode].position.y = Number(slider.value)
        if (slider.id === "zPosition")
            nodeData[selectedNode].position.z = Number(slider.value)
        updateSelectedKeyframe()
    })
})

var isPlaying = false
let lastTime = 0

let timeline = document.getElementById("timeline")
let timelineElapsed = document.getElementById("timelineElapsed")
timeline.addEventListener("input", () => {
    let time = Number(timeline.value)
    timelineElapsed.value = time.toFixed(1)
    if (keyframes.length > 0) {
        updateModelAtTime(time)
    }
})

var keyframes = []
var selectedKeyframe = null

var updateModelAtTime = (time) => {
    if (keyframes.length === 0) return
    if (keyframes.length == 1) {
        nodeData = structuredClone(keyframes[0].data)
        loadNodeData()
        return
    }
    let previous = keyframes[0]
    let next = keyframes[keyframes.length - 1]
    for (let i = 0; i < keyframes.length - 1; i++) {
        if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
            previous = keyframes[i]
            next = keyframes[i + 1]
            break
        }
    }
    if (time <= previous.time) {
        nodeData = structuredClone(previous.data)
        loadNodeData()
        return
    }
    if (time >= next.time) {
        nodeData = structuredClone(next.data)
        loadNodeData()
        return
    }
    let range = next.time - previous.time
    let t = range === 0 ? 0 : (time - previous.time) / range
    let newData = structuredClone(previous.data)
    for (let nodeName in newData) {
        let a = previous.data[nodeName]
        let b = next.data[nodeName]
        if (!a || !b) continue
        newData[nodeName].position.x = a.position.x + (b.position.x - a.position.x) * t
        newData[nodeName].position.y = a.position.y + (b.position.y - a.position.y) * t
        newData[nodeName].position.z = a.position.z + (b.position.z - a.position.z) * t
        var angleLerp = (a, b, t) => {
            if (Math.abs(a - b) === 360) {
                b = a
            }
            let delta = ((b - a + 180) % 360) - 180
            return a + delta * t
        }
        newData[nodeName].rotation.x = angleLerp(a.rotation.x, b.rotation.x, t)
        newData[nodeName].rotation.y = angleLerp(a.rotation.y, b.rotation.y, t)
        newData[nodeName].rotation.z = angleLerp(a.rotation.z, b.rotation.z, t)
    }
    nodeData = newData
    loadNodeData()
}

var addKeyframe = () => {
    let time = Number(Number(timeline.value).toFixed(1))
    if (keyframes.some(keyframe => Math.abs(keyframe.time - time) < 0.0001)) {
        return
    }
    let keyframe = { time: time, data: structuredClone(nodeData) }
    keyframes.push(keyframe)
    keyframes.sort((a, b) => a.time - b.time)
    updateKeyframeMarkers()
}

var updateKeyframeMarkers = () => {
    let c = document.getElementById("keyframe-markers")
    c.innerHTML = ""
    let length = Number(document.getElementById("animation-length").value)
    for (let keyframe of keyframes.filter(keyframe => keyframe.time <= length)) {
        let marker = document.createElement("div")
        marker.className = "keyframe-marker"
        let percent = ((keyframe.time - Number(timeline.min)) / (Number(timeline.max) - Number(timeline.min))) * 100
        marker.style.left = percent + "%"
        marker.title = keyframe.time + "s"
        marker.onclick = event => {
            event.stopPropagation()
            selectedKeyframe = keyframe
            timeline.value = keyframe.time
            timelineElapsed.value = keyframe.time.toFixed(1)
            updateModelAtTime(keyframe.time)
            updateKeyframeMarkers()
            isPlaying = false
        }
        if (selectedKeyframe === keyframe) {
            marker.classList.add("selected")
        }
        c.appendChild(marker)
    }
}

document.getElementById("keyframe-bar").addEventListener("click", (event) => {
    if (event.target.classList.contains("keyframe-marker")) return
    selectedKeyframe = null
    updateKeyframeMarkers()
})
document.getElementById("add-keyframe").onclick = addKeyframe
document.getElementById("del-keyframe").onclick = () => {
    if (!selectedKeyframe) return
    keyframes = keyframes.filter(keyframe => keyframe !== selectedKeyframe)
    selectedKeyframe = null
    updateKeyframeMarkers()
}
document.getElementById("des-keyframe").onclick = () => {
    selectedKeyframe = null
    updateKeyframeMarkers()
}

var importBase64 = (base64) => {
    try {
        base64 = base64.trim()
        let json = decodeURIComponent(escape(atob(base64)))
        let data = JSON.parse(json)
        if (data.format !== "bloxdmation") {
            showPopup(false, "Invalid file type.", "Only valid .bloxdmation Base64 data is supported.")
            return
        }
        if (data.version !== currentVersion) {
            showPopup(false, "Outdated file version.", "This .bloxdmation file is outdated.")
            return
        }
        keyframes = data.keyframes || []
        selectedKeyframe = null
        document.getElementById("animation-length").value = data.animationLength
        timeline.max = data.animationLength
        document.getElementById("loop-mode").checked = data.loop
        document.getElementById("animation-name").value = data.name || "Untitled Animation"
        document.getElementById("animation-speed").value = data.speed ?? 1
        document.getElementById("lerpmode-select").value = data.lerp || "linear"
        if (keyframes.length > 0) {
            keyframes.sort((a, b) => a.time - b.time)
            nodeData = structuredClone(keyframes[0].data)
            timeline.value = keyframes[0].time
            timelineElapsed.value = keyframes[0].time.toFixed(1)
            loadNodeData()
        } else {
            nodeData = {
                HeadMesh: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                },
                TorsoNode: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                },
                ArmLeftMesh: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                },
                ArmRightMesh: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                },
                LegLeftMesh: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                },
                LegRightMesh: {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                }
            }
            timeline.value = 0
            timelineElapsed.value = "0.0"
            loadNodeData()
        }
        updateKeyframeMarkers()
        showPopup(true, "Base64 string imported.", "The Base64 animation has been imported successfully.")
    } catch (error) {
        console.error(error)
        showPopup(false, "Could not import Base64 string.", "The Base64 data is either invalid or corrupted.")
    }
}

var importAnimationCode = (code) => {
    try {
        code = code.trim()
        let match = code.match(/api\.animateEntity\s*\(\s*[^,]+,\s*([\s\S]*),\s*([^,]+),\s*([^)]+)\s*\)\s*;?\s*$/)
        if (!match) {
            showPopup(false, "Invalid code.", "The code provided is invalid.")
            return
        }
        let config = JSON.parse(match[1])
        let animSpeed = Number(match[3])
        if (!config.animationDurationMs || !config.nodeAnimations) {
            showPopup(false, "Invalid code.", "The code does not contain a valid animation configuration.")
            return
        }
        let animationLength = config.animationDurationMs / 1000
        document.getElementById("animation-length").value = animationLength
        document.getElementById("animation-speed").value = animSpeed
        timeline.max = animationLength
        document.getElementById("loop-mode").checked = config.loop ?? false
        keyframes = []
        let nodes = Object.keys(nodeData)
        let times = new Set([0])
        for (let nodeName of nodes) {
            let animation = config.nodeAnimations[nodeName]
            if (!animation?.timeline) continue

            for (let point of animation.timeline) {
                times.add(point.timeFraction * animationLength)
            }
        }
        for (let time of [...times].sort((a, b) => a - b)) {
            let data = {}
            for (let nodeName of nodes) {
                data[nodeName] = {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                }
                let animation = config.nodeAnimations[nodeName]
                if (!animation?.timeline) continue
                let currentPosition = { x: 0, y: 0, z: 0 }
                let currentRotation = { x: 0, y: 0, z: 0 }

                for (let point of animation.timeline) {
                    let pointTime = point.timeFraction * animationLength
                    if (pointTime > time) break
                    if (point.position) {
                        let position = point.position.point || point.position
                        currentPosition = {
                            x: Number(position[0] ?? 0),
                            y: Number(position[1] ?? 0),
                            z: -Number(position[2] ?? 0)
                        }
                    }
                    if (point.rotation) {
                        let rotation = point.rotation.point || point.rotation
                        currentRotation = {
                            x: Number(rotation[0] ?? 0) * 180 / Math.PI,
                            y: Number(rotation[1] ?? 0) * 180 / Math.PI,
                            z: Number(rotation[2] ?? 0) * 180 / Math.PI
                        }
                    }
                }
                data[nodeName] = { position: currentPosition, rotation: currentRotation }
            }
            keyframes.push({ time: Number(time.toFixed(4)), data })
        }
        selectedKeyframe = null
        selectedNode = "HeadMesh"
        document.getElementById("selected-node").textContent = "Head"
        keyframes.sort((a, b) => a.time - b.time)
        timeline.value = 0
        timelineElapsed.value = "0.0"
        if (keyframes.length > 0) {
            nodeData = structuredClone(keyframes[0].data)
            loadNodeData()
        }
        updateKeyframeMarkers()
        setTimeout(() => { showPopup(true, "Code imported.", "The code animation has been imported successfully.") }, 0)
    } catch (error) {
        console.error(error)
        showPopup(false, "Could not import code.", "Please try again.")
    }
}

var animate = (time) => {
    if (isPlaying) {
        if (!lastTime) lastTime = time
        let lf = (time - lastTime) / 1000
        lastTime = time
        let speed = Number(document.getElementById("animation-speed").value)
        timeline.value = Math.min(Number(timeline.value) + speed * lf, Number(timeline.max))
        timelineElapsed.value = Number(timeline.value).toFixed(1)
        if (keyframes.length > 0) {
            updateModelAtTime(Number(timeline.value))
        }
        if (Number(timeline.value) >= Number(timeline.max)) {
            if (document.getElementById("loop-mode").checked) {
                timeline.value = Number(timeline.min)
                timelineElapsed.value = Number(timeline.value).toFixed(1)
                if (keyframes.length > 0) {
                    updateModelAtTime(Number(timeline.value))
                }
            } else {
                isPlaying = false
            }
        }
    } else {
        lastTime = 0
    }
    requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

document.getElementById("play-button").onclick = () => {
    isPlaying = true
}
document.getElementById("pause-button").onclick = () => {
    isPlaying = false
}
document.getElementById("restart-button").onclick = () => {
    timeline.value = timeline.min
    timelineElapsed.value = timeline.value
    isPlaying = false
}
document.getElementById("back-button").onclick = () => {
    timeline.value = Math.max(Number(timeline.value) - 2, Number(timeline.min))
    timelineElapsed.value = Number(timeline.value).toFixed(1)
}
document.getElementById("forward-button").onclick = () => {
    timeline.value = Math.min(Number(timeline.value) + 2, Number(timeline.max))
    timelineElapsed.value = Number(timeline.value).toFixed(1)
}

document.getElementById("export-button").onclick = async () => {
    let animL = Number(document.getElementById("animation-length").value)
    let lerp = document.getElementById("lerpmode-select").value
    let loop = document.getElementById("loop-mode").checked
    let animSpd = Number(document.getElementById("animation-speed").value)
    let animConfig = {
        animationDurationMs: animL <= 0 ? 1 : Math.ceil(animL * 1000),
        loop: animL <= 0 ? true : loop,
        nodeAnimations: {}
    }
    if (keyframes.length === 0) {
        for (let nodeName in nodeData) {
            let node = nodeData[nodeName]
            let timeline = [{
                timeFraction: 0,
                position: [round(node.position.x), round(node.position.y), round(-node.position.z)],
                rotation: [round(node.rotation.x * Math.PI / 180), round(node.rotation.y * Math.PI / 180), round(node.rotation.z * Math.PI / 180)]
            }]
            console.log(node.rotation.x, node.rotation.y, node.rotation.z)
            let isDefault = node.position.x === 0 && node.position.y === 0 && node.position.z === 0 && node.rotation.x === 0 && node.rotation.y === 0 && node.rotation.z === 0
            if (!isDefault) {
                animConfig.nodeAnimations[nodeName] = { timeline }
            }
        }
    } else {
        let exportKeyframes = keyframes.filter(keyframe => keyframe.time <= animL)
        let firstData = exportKeyframes[0]?.data
        for (let nodeName in nodeData) {
            let timeline = []
            let previousNode = null
            for (let keyframe of keyframes.filter(keyframe => keyframe.time <= animL)) {
                let node = keyframe.data[nodeName]
                if (!node) continue
                let point = { timeFraction: animL === 0 ? 0 : keyframe.time / animL }
                let positionChanged = !previousNode || node.position.x !== previousNode.position.x || node.position.y !== previousNode.position.y || node.position.z !== previousNode.position.z
                let rotationChanged = !previousNode || node.rotation.x !== previousNode.rotation.x || node.rotation.y !== previousNode.rotation.y || node.rotation.z !== previousNode.rotation.z
                if (positionChanged) {
                    point.position = [round(node.position.x), round(node.position.y), round(-node.position.z)]
                }
                if (rotationChanged) {
                    point.rotation = [round(node.rotation.x * Math.PI / 180), round(node.rotation.y * Math.PI / 180), round(node.rotation.z * Math.PI / 180)]
                }
                if (positionChanged || rotationChanged) {
                    timeline.push(point)
                }
                previousNode = node
            }
            if (timeline.length > 0 && firstData) {
                let hasChanged = false
                for (let keyframe of keyframes.filter(keyframe => keyframe.time <= animL)) {
                    let node = keyframe.data[nodeName]
                    let firstNode = firstData[nodeName]
                    if (node.position.x !== firstNode.position.x || node.position.y !== firstNode.position.y || node.position.z !== firstNode.position.z || node.rotation.x !== firstNode.rotation.x || node.rotation.y !== firstNode.rotation.y || node.rotation.z !== firstNode.rotation.z) { hasChanged = true; break }
                }
                let firstNode = firstData[nodeName]
                let firstIsDefault = firstNode.position.x === 0 && firstNode.position.y === 0 && firstNode.position.z === 0 && firstNode.rotation.x === 0 && firstNode.rotation.y === 0 && firstNode.rotation.z === 0
                if (hasChanged || !firstIsDefault) {
                    for (let point of timeline) {
                        if (point.position) {
                            if (point.position[0] === 0 && point.position[1] === 0 && point.position[2] === 0) {
                                delete point.position
                            } else if (lerp === "catmull-rom-spline") {
                                point.position = { point: point.position, lerpMode: lerp }
                            }
                        }
                        if (point.rotation && lerp === "catmull-rom-spline") {
                            point.rotation = { point: point.rotation, lerpMode: lerp }
                        }
                    }
                    animConfig.nodeAnimations[nodeName] = { timeline }
                }
            }
        }
    }
    let codeAboutToBeExported = "api.animateEntity(myId, " + JSON.stringify(animConfig, null, 2) + ", 0, " + animSpd + ")"
    try {
        await navigator.clipboard.writeText(codeAboutToBeExported)
        showPopup(true, "Code saved to clipboard.", "Paste the code into a Code Block to view the animation! Code contents can also be copied below.", codeAboutToBeExported)
        //document.getElementById("code-saved-popup").style.display = "flex"
        //alert("Code saved to clipboard.\nPaste it in a Code Block to view the animation!")
    } catch (error) {
        showPopup(false, "Code could not be saved.", "Please try again.")
    }
}

document.getElementById("reset-button").onclick = () => {
    nodeData = {
        HeadMesh: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        TorsoNode: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        ArmLeftMesh: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        ArmRightMesh: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        LegLeftMesh: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        LegRightMesh: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        }
    }
    keyframes = []
    selectedKeyframe = null
    isPlaying = false
    lastTime = 0
    timeline.value = timeline.min
    timelineElapsed.value = Number(timeline.min).toFixed(1)
    document.getElementById("animation-length").value = 10
    timeline.max = 10
    document.getElementById("loop-mode").checked = false
    document.getElementById("lerpmode-select").value = "linear"
    buttons.forEach(btn => btn.classList.remove("selected"))
    buttons[0].classList.add("selected")
    selectedNode = buttons[0].id
    selectedNodeSpan.textContent = buttons[0].id
    loadNodeData()
    updateKeyframeMarkers()
    Spatium.camZ = -50
    Spatium.camY = 16
    Spatium.camX = 35
    Spatium.camRotYRad = Math.PI / 5
    document.getElementById("animation-name").value = ""
}

document.getElementById("animation-length").addEventListener("input", e => {
    let length = Number(e.target.value)
    timeline.max = length
    timeline.value = Math.min(Number(timeline.value), length)
    timelineElapsed.value = Number(timeline.value).toFixed(1)
    if (selectedKeyframe && selectedKeyframe.time > length) {
        selectedKeyframe = null
    }
    updateKeyframeMarkers()
    if (keyframes.length > 0) {
        updateModelAtTime(Number(timeline.value))
    }
})

document.getElementById("code-saved-popup").addEventListener("click", event => {
    if (event.target === event.currentTarget) {
        event.currentTarget.style.display = "none"
    }
})
document.getElementById("code-saving-error-popup").addEventListener("click", event => {
    if (event.target === event.currentTarget) {
        event.currentTarget.style.display = "none"
    }
})

let currentVersion = 3

document.getElementById("export-json-button").onclick = () => {
    let data = {
        format: "bloxdmation",
        version: currentVersion,
        animationLength: Number(document.getElementById("animation-length").value),
        loop: document.getElementById("loop-mode").checked,
        keyframes: keyframes,
        speed: Number(document.getElementById("animation-speed").value),
        name: document.getElementById("animation-name").value || "Untitled Animation",
        lerp: document.getElementById("lerpmode-select").value
    }
    let json = JSON.stringify(data)
    let base64 = btoa(unescape(encodeURIComponent(json)))
    let blob = new Blob([base64], { type: "text/plain" })
    let url = URL.createObjectURL(blob)
    let a = document.createElement("a")
    a.href = url
    a.download = (document.getElementById("animation-name").value || "Untitled Animation") + ".bloxdmation"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showPopup(true, "Animation file saved.", "Your .bloxdmation file (" + (document.getElementById("animation-name").value || "Untitled Animation") + ") has been successfully saved locally. File contents can be copied below.", base64)
}

document.getElementById("import-file").onchange = (event) => {
    let file = event.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".bloxdmation")) {
        showPopup(false, "Invalid file.", "Only .bloxdmation files are supported.")
        event.target.value = ""
        return
    }

    let reader = new FileReader()
    reader.onload = () => {
        try {
            let json = decodeURIComponent(escape(atob(reader.result.trim())))
            let data = JSON.parse(json)
            if (data.format !== "bloxdmation") {
                showPopup(false, "Invalid file type.", "Only .bloxdmation files are supported.")
                return
            }
            if (data.version !== currentVersion) {//replace this with currentVersion
                showPopup(false, "Outdated file version.", "This .bloxdmation file is outdated.")
                return
            }
            keyframes = data.keyframes || []
            selectedKeyframe = null
            document.getElementById("animation-length").value = data.animationLength
            timeline.max = data.animationLength
            document.getElementById("loop-mode").checked = data.loop
            document.getElementById("animation-name").value = data.name
            document.getElementById("animation-speed").value = data.speed
            document.getElementById("lerpmode-select").value = data.lerp
            if (keyframes.length > 0) {
                keyframes.sort((a, b) => a.time - b.time)
                nodeData = structuredClone(keyframes[0].data)
                timeline.value = keyframes[0].time
                timelineElapsed.value = keyframes[0].time.toFixed(1)
                loadNodeData()
            }
            updateKeyframeMarkers()
            showPopup(true, "File loaded.", "Your file has successfully been loaded into the animator!")
        } catch (error) {
            showPopup(false, "Could not load file.", "This file type is unsupported or its contents are corrupted.")
        }
    }
    reader.readAsText(file)
}
document.getElementById("import-json-button").onclick = () => {
    document.getElementById("import-file").click()
}

let input = document.getElementById('animation-name')
input.addEventListener('input', function () {
    console.log(1)
    this.value = this.value.replace(/[^a-zA-Z_0-9 ]/g, '')
})

window.addEventListener("beforeunload", event => {
    event.preventDefault()
    event.returnValue = ""
})

document.getElementById("import-code-button").onclick = () => {
    showPopup(true, "Import Animation Code", "Paste your api.animateEntity code below.", "", true)
}

document.getElementById("import-base64-button").onclick = () => {
    showPopup(true, "Import Base64", "Paste your Base64 data below.", "", true)
}
