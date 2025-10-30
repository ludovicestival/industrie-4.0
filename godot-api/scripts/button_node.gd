extends Node3D

@onready var mesh = $ButtonModel/Button
@onready var http_request = $HTTPRequest
@export var api_url = "" # changed in main scene script

var is_button_on = false
var angle = 15

func send_put_request(url, data):
	var json_data = JSON.stringify(data)
	var headers = ["Content-Type: application/json"]
	
	var error = http_request.request(
		url,
		headers,
		HTTPClient.METHOD_PUT,
		json_data
	)
	
	if error != OK:
		print("BUTTON: error from PUT:", error)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_on_input_event(camera: Node, event: InputEvent, event_position: Vector3, normal: Vector3, shape_idx: int) -> void:
	if event.is_pressed() and not is_button_on:
		is_button_on = true
		mesh.rotate(Vector3.RIGHT, deg_to_rad(angle))
		angle = -30
		send_put_request(api_url, {"state": true})

func _on_off_input_event(camera: Node, event: InputEvent, event_position: Vector3, normal: Vector3, shape_idx: int) -> void:
	if event.is_pressed() and is_button_on:
		is_button_on = false
		mesh.rotate(Vector3.RIGHT, deg_to_rad(angle))
		angle = 30
		send_put_request(api_url, {"state": false})


func _on_http_request_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	var response_text = body.get_string_from_utf8()
	var json = JSON.parse_string(response_text)
	if typeof(json) == TYPE_DICTIONARY:
		if json.has("success"):
			print("BUTTON: response from PUT:", json.get("success"))
