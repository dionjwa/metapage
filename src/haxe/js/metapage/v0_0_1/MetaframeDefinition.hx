package js.metapage.v0_0_1;

typedef MetaframeDefinition = {
	@:optional var version :MetaframeDefinitionVersion;
	@:optional var inputs :Array<MetaframePipeDefinition>;
	@:optional var outputs :Array<MetaframePipeDefinition>;
	@:optional var metadata :MetaframeMetadata;
}