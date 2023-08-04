from js import first, molstar, console
import asyncio

async def main():
    print("Well, hi!")
    print(first.foo)
    print(first.baz())

    # molstar.Viewer.create("molstar-viewer")
    # console.log("molstar...", molstar)
    viewer = await molstar.Viewer.create('molstar-viewer', {
        'layoutIsExpanded':False,
        'layoutShowControls': False,
        'layoutShowRemoteState': False,
        'layoutShowSequence': True,
        'layoutShowLog': False,
        'layoutShowLeftPanel': True,

        'viewportShowExpand': True,
        'viewportShowSelectionMode': False,
        'viewportShowAnimation': False,

        'pdbProvider': 'rcsb',
        'emdbProvider': 'rcsb',
    })

    viewer.loadPdb('7bv2');
    viewer.loadEmdb('EMD-30210', {'detail': 6})

asyncio.ensure_future(main())