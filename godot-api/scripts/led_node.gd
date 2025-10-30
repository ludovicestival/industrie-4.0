extends Node3D

@onready var led = $LedModel/LED
@onready var http_request = $HTTPRequest
@export var is_led_on = false
@export var api_url = "http://127.0.0.1:5000/api/devices/led-001"

var led_color = Color(1, 0, 0, 1)

func send_get_request(url):
	var headers = ["Accept: application/json"]
	
	var error = http_request.request(
		url,
		headers,
		HTTPClient.METHOD_GET
	)
	
	if error != OK:
		print("LED: error from GET:", error)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	led.get_active_material(0).albedo_color = Color(0, 0, 0, 1)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	if is_led_on:
		led.get_active_material(0).albedo_color = led_color
	else:
		led.get_active_material(0).albedo_color = Color(0, 0, 0, 1)


func _on_timer_timeout() -> void:
	send_get_request(api_url)


func _on_http_request_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	print("LED: reading state")
	var response_text = body.get_string_from_utf8()
	var json = JSON.parse_string(response_text)
	if typeof(json) == TYPE_DICTIONARY:
		if json.has("state"):
			is_led_on = json.get("state")
