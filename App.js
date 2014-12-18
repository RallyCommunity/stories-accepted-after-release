Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var rComboBox = Ext.create('Rally.ui.combobox.ReleaseComboBox',{
            context:{
                workspace: this.getContext().getWorkspace()
            },
            listeners:{
                ready: function(combobox){
                    this._getData(combobox.getRecord());
                },
                select: function(combobox){
                    this._getData(combobox.getRecord());
                },
                scope: this
            }
        });
        this.add(rComboBox);
    },
    _getData: function(release){
        var releaseRef = release.get('_ref');
        var releaseDate = release.get('ReleaseDate');
        var releaseDateISO = Rally.util.DateTime.toIsoString(releaseDate,true);
        console.log('loading stories (and defects) scheduled for the release with release date:', releaseDateISO);

        //var myStore = Ext.create('Rally.data.wsapi.Store',{   //use with one model type
        var myStore = Ext.create('Rally.data.wsapi.artifact.Store',{
            //model: 'User Story',
            models: ['Defect', 'UserStory'],
            autoLoad:true,
            fetch: ['Name','FormattedID','ScheduleState','Release','ReleaseDate','AcceptedDate','Project'],
            filters:[
                {
                    property : 'ScheduleState',
                    operator : '=',
                    value : 'Accepted'
                },
                {
                    property : 'Release',
                    value : releaseRef
                },
                {
                    property : 'AcceptedDate',
                    operator : '>',
                    value: releaseDateISO
                }
            ],
            listeners: {
                load: function(store,records,success){
                    console.log("loaded %i records", records.length);
                    this._updateGrid(myStore);
                },
                scope:this
            }
        });
    },

    _updateGrid: function(myStore){
        if(this._myGrid === undefined){
            this._createGrid(myStore);
        }
        else{
            this._myGrid.reconfigure(myStore);
        }
    },

    _createGrid: function(myStore){
        var that = this;
        this._myGrid = Ext.create('Ext.grid.Panel', {
            title: 'Stories and Defects accepted after Release Date',
            store: myStore,
            columns: [
                {
                    text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {text: 'Name', dataIndex: 'Name', minWidth: 200},
                {text: 'AcceptedDate', dataIndex: 'AcceptedDate',renderer:function(value){
                        return  Rally.util.DateTime.toIsoString(value,true);
                    },
                    minWidth: 200
                },
                {text: 'Release', dataIndex: 'Release',  renderer: function(value){
                           return value.ReleaseDate;
                    },
                    minWidth: 200

                },
                {text: 'Project', dataIndex: 'Project',renderer:function(value){
                    return  value.Name;
                },
                    minWidth: 200
                }

            ],
            height: 400
        });
        this.add(this._myGrid);
    }
});
