extends Node3D

@onready var led = $LedNode
@onready var button = $ButtonNode

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	button.api_url = led.api_url
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_timer_timeout() -> void:
	pass # Replace with function body.
